import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserId = Principal;

  // ── V1 types (kept for stable migration deserialization) ──────────────────
  type FileTypeV1 = { #image; #video };

  type FileMetaV1 = {
    fileName : Text;
    fileType : FileTypeV1;
    uploadDate : Time.Time;
    blob : Storage.ExternalBlob;
  };

  // ── Current types ─────────────────────────────────────────────────────────
  type FileType = {
    #image;
    #video;
    #document;
    #other;
  };

  type FileMeta = {
    fileName : Text;
    fileType : FileType;
    uploadDate : Time.Time;
    blob : Storage.ExternalBlob;
  };
  module FileMeta {
    public func compareByUploadDate(file1 : FileMeta, file2 : FileMeta) : Order.Order {
      Int.compare(file1.uploadDate, file2.uploadDate);
    };
  };

  type UserProfile = {
    username : Text;
  };

  let userProfiles = Map.empty<UserId, UserProfile>();

  // Legacy stable map — Motoko deserializes old on-chain data into this.
  // Never written after this migration; only read in postupgrade.
  let userFiles = Map.empty<UserId, List.List<FileMetaV1>>();

  // Current stable map with the extended FileType.
  let userFilesV2 = Map.empty<UserId, List.List<FileMeta>>();

  // Migrate once: copy V1 entries into userFilesV2 on first upgrade.
  system func postupgrade() {
    for ((userId, fileList) in userFiles.entries()) {
      switch (userFilesV2.get(userId)) {
        case (?_) {}; // already present — skip
        case (null) {
          let newList = List.empty<FileMeta>();
          for (f in fileList.toArray().vals()) {
            newList.add({
              fileName = f.fileName;
              fileType = switch (f.fileType) {
                case (#image) { #image };
                case (#video) { #video };
              };
              uploadDate = f.uploadDate;
              blob = f.blob;
            });
          };
          userFilesV2.add(userId, newList);
        };
      };
    };
  };

  // ── Public API ────────────────────────────────────────────────────────────

  // Register new user
  public shared ({ caller }) func register(username : Text) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let profile : UserProfile = { username };
    userProfiles.add(caller, profile);
  };

  // Upload file — only registered users
  public shared ({ caller }) func uploadFile(fileName : Text, fileType : FileType, externalBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can upload files");
    };
    let fileMeta : FileMeta = {
      fileName;
      fileType;
      uploadDate = Time.now();
      blob = externalBlob;
    };
    var files = switch (userFilesV2.get(caller)) {
      case (null) { List.empty<FileMeta>() };
      case (?fileList) { fileList };
    };
    files.add(fileMeta);
    userFilesV2.add(caller, files);
  };

  // List files for the caller
  public shared ({ caller }) func listFiles() : async [FileMeta] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can list files");
    };
    switch (userFilesV2.get(caller)) {
      case (null) { [] };
      case (?files) { files.toArray().sort(FileMeta.compareByUploadDate) };
    };
  };

  // Delete file by fileName
  public shared ({ caller }) func deleteFile(fileName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete files");
    };
    let files = switch (userFilesV2.get(caller)) {
      case (null) { Runtime.trap("File not found") };
      case (?files) { files };
    };
    let filteredFiles = files.filter(func(file) { file.fileName != fileName });
    userFilesV2.add(caller, filteredFiles);
  };

  // Get profile for any user (admin or self)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
