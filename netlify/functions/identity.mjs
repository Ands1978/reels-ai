export default {
  userSignup(event) {
    return {
      user: {
        ...event.user,
        appMetadata: {
          ...(event.user.appMetadata || {}),
          plan: "free",
          roles: ["customer"]
        }
      }
    };
  }
};
