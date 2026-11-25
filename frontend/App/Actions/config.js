import { showMessage } from "react-native-flash-message";
import { c } from "../Utilities/colors";
// (No native positioning needed; handled by FlashMessage component)



const formatMessage = (text) => {
    if (!text) return "";
    let formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    formatted = formatted.replace(/\bmeetwave\b/g, "Meetwave");
    formatted = formatted.replace(/([.!?]\s+)to\s/g, "$1To ");
    formatted = formatted.replace(/([.!?]\s+)([a-z])/g, (_, punct, letter) => punct + letter.toUpperCase());
    return formatted;
};

export const showpossitvemessage = (title, description) => {
    showMessage({
        message: title,
        description: formatMessage(description),
        backgroundColor: c.intermediate,
        type: "success",
        duration: 2500,
        floating: true,
        position: "top",
        // position is handled by FlashMessage's statusBarHeight + marginTop
    });
}

export const shownegativemessage = (title, description) => {
    showMessage({
        message: title,
        description: formatMessage(description),
        type: "danger",
        duration: 2500,
        floating: true,
        position: "top",
        // position is handled by FlashMessage's statusBarHeight + marginTop
    });
}
/** True when the user has a non-expired paid subscription (any plan entry). */
export const hasActiveSubscription = (profile) => {
    const plans = profile?.plan;
    if (!Array.isArray(plans) || plans.length === 0) {
        return false;
    }
    const now = Date.now();
    return plans.some((plan) => {
        if (plan?.isActive !== "started") {
            return false;
        }
        if (plan?.subscriptionStatus === "expired" || plan?.subscriptionStatus === "cancel") {
            return false;
        }
        if (plan?.EndDate && new Date(plan.EndDate).getTime() < now) {
            return false;
        }
        return true;
    });
};

/** Free / unpaid users are limited to a fixed number of hobbies in search filters. */
export const isHobbyLimitEnforced = (profile) => !hasActiveSubscription(profile);

/** Message for the hobby-limit modal (matches Meetwave free-tier copy). */
export const getHobbyLimitModalMessage = (limit, t) =>
    t("hobby_limit_free_search", {
        limit,
        defaultValue: `With the free version of Meetwave you can search up to ${limit} hobbies at a time. To search unlimited, please subscribe.`,
    });

export const showwarningmessage = (title, description) => {
    showMessage({
        message: title,
        description: formatMessage(description),
        backgroundColor: c.intermediate,
        color: "#fff",
        type: "danger",
        duration: 5500,
        floating: true,
        position: "top",
        // position is handled by FlashMessage's statusBarHeight + marginTop
    });
}
