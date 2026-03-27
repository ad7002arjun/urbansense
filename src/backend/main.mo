import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types & Compare
  type ReportId = Nat;

  type ReportStatus = {
    #reported;
    #inProgress;
    #resolved;
  };

  type Urgency = {
    #urgent;
    #standard;
  };

  type Category = {
    #pothole;
    #streetlight;
    #garbage;
    #graffiti;
    #waterIssue;
    #other;
  };

  public type Report = {
    id : ReportId;
    title : Text;
    description : Text;
    location : Text;
    category : Category;
    urgency : Urgency;
    image : Storage.ExternalBlob;
    classificationLabel : Text;
    submittedBy : Principal;
    createdAt : Time.Time;
    status : ReportStatus;
  };

  public type Stats = {
    totalReports : Nat;
    urgentReports : Nat;
    resolvedReports : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module Report {
    public func compare(report1 : Report, report2 : Report) : Order.Order {
      Int.compare(report2.createdAt, report1.createdAt);
    };
  };

  // State
  let reports = Map.empty<ReportId, Report>();
  var nextReportId : ReportId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Storage
  include MixinStorage();

  // Authorization

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create Report
  public shared ({ caller }) func submitReport(reportInput : Report) : async ReportId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reports");
    };

    let reportId = nextReportId;
    nextReportId += 1;

    let newReport : Report = {
      reportInput with
      id = reportId;
      submittedBy = caller;
      createdAt = Time.now();
      status = #reported;
    };

    reports.add(reportId, newReport);
    reportId;
  };

  // Get My Reports
  public query ({ caller }) func getMyReports() : async [Report] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their reports");
    };
    reports.values().toArray().filter(
      func(r) { r.submittedBy == caller }
    );
  };

  // Get Recent Reports
  public query ({ caller }) func getRecentReports() : async [Report] {
    let sortedReports = reports.values().toArray().sort();
    let takeSize = Nat.min(20, sortedReports.size());
    sortedReports.sliceToArray(0, takeSize);
  };

  // Admin: Get All Reports
  public query ({ caller }) func getAllReports() : async [Report] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    reports.values().toArray();
  };

  // Admin: Update Report Status
  public shared ({ caller }) func updateReportStatus(reportId : ReportId, newStatus : ReportStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        let updatedReport : Report = {
          report with
          status = newStatus;
        };
        reports.add(reportId, updatedReport);
      };
    };
  };

  // Get Statistics
  public query ({ caller }) func getStats() : async Stats {
    var total = 0;
    var urgent = 0;
    var resolved = 0;

    for (report in reports.values()) {
      total += 1;
      if (report.urgency == #urgent) { urgent += 1 };
      if (report.status == #resolved) { resolved += 1 };
    };

    {
      totalReports = total;
      urgentReports = urgent;
      resolvedReports = resolved;
    };
  };
};
