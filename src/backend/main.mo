import Int "mo:core/Int";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  type GameMetadata = {
    name : Text;
    description : Text;
    category : Text;
  };

  type ScoreEntry = {
    playerName : Text;
    score : Int;
    timestamp : Time.Time;
  };

  module ScoreEntry {
    public func compare(s1 : ScoreEntry, s2 : ScoreEntry) : Order.Order {
      Int.compare(s2.score, s1.score);
    };
  };

  let scoreEntries = Map.empty<Text, List.List<ScoreEntry>>();
  let games = Map.empty<Text, GameMetadata>();
  let totalPlays = Map.empty<Text, Int>();

  public shared ({ caller }) func addGame(name : Text, description : Text, category : Text) : async () {
    if (games.containsKey(name)) { Runtime.trap("Game already exists") };
    let metadata : GameMetadata = {
      name;
      description;
      category;
    };
    games.add(name, metadata);
    totalPlays.add(name, 0);
  };

  public shared ({ caller }) func submitScore(game : Text, playerName : Text, score : Int) : async () {
    if (not games.containsKey(game)) { Runtime.trap("Game does not exist") };

    let newScore : ScoreEntry = {
      playerName;
      score;
      timestamp = Time.now();
    };

    let scores = switch (scoreEntries.get(game)) {
      case (null) { List.empty<ScoreEntry>() };
      case (?existingScores) { existingScores };
    };
    scores.add(newScore);

    scoreEntries.add(game, scores);

    switch (totalPlays.get(game)) {
      case (null) {
        totalPlays.add(game, 1);
      };
      case (?count) {
        totalPlays.add(game, count + 1);
      };
    };
  };

  public query ({ caller }) func getTopScores(game : Text, limit : Nat) : async [ScoreEntry] {
    switch (scoreEntries.get(game)) {
      case (null) { Runtime.trap("No scores found") };
      case (?scores) {
        let sortedScores = scores.toArray().sort();

        let safeLimit = if (limit > sortedScores.size()) {
          sortedScores.size();
        } else {
          limit;
        };

        sortedScores.sliceToArray(0, safeLimit);
      };
    };
  };

  public query ({ caller }) func getGameMetadata() : async [GameMetadata] {
    games.values().toArray();
  };

  public query ({ caller }) func getTotalPlays(game : Text) : async Int {
    switch (totalPlays.get(game)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?count) { count };
    };
  };
};
