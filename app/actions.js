/**
 * Static class that gathers the different actions that can be run
 * by the user through the application.
 */
module.exports = class Actions {
  static soundCloudSignIn() {
    Service.for('soundcloud').signin()
  }

  static soundCloudSignOut() {
    Service.for('soundcloud').signout()
  }

  static youTubeSignIn() {
    Service.for('youtube').signin()
  }

  static youTubeSignOut() {
    Service.for('youtube').signout()
  }
}
