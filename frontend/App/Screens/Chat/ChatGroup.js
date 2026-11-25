import { AppState, Image, Keyboard, Pressable, Platform, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, Alert, FlatList, ActivityIndicator, Linking, Animated, } from "react-native";
import {
    borderradius,
    deviceheight,
    devicewidth,
    pxToPercentage,
} from "../../Utilities/Dimensions";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import LinearGradient from "react-native-linear-gradient";
import { c } from "../../Utilities/colors";
import { Images, Lotties } from "../../Utilities/images";
import { Fonts } from "../../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
    useFocusEffect,
    useIsFocused,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
    GetSingleChats,
    helperSelector,
    update_FetchProfileId,
    update_ChatMembersOrderList,
    update_EventChatOrderList,
    update_NetworkVisible,
    update_SingleFetchChat,
    update_SingleOrderChatMembersList,
    update_filterBySearch,
    update_statusbarcolor,
} from "../../Slices/helper";
import { ChatImageurl, Imageurl } from "../../Actions/constant";
import { GetItem, RemoveItem, SetItem } from "../../Actions/localstorage";
import { Imagepicker, UserBlockandUnblock, createMessage, deleteMessage, downloadImage, editMessage, getChatDataList } from "../../Actions/hooks";
import { clearChatNotification } from "../../Actions/pushnotificationconfig";
import {
    CREATEMESSAGE,
    HandleTyping,
    JoinRoom,
    MembersList,
    REMOVE_ROOM,
    SeenUnseen,
    StopTyping,
    ensureSocketConnection,
    get_SeenData,
    socket as socketClient,
    subscribeChatSocket,
    updateAppPresence,
} from "../../Actions/socket";
import SocketContext from "../../Context/SocketContext";
import { Fetchprofile, profileSelector } from "../../Slices/profile";
import ImageViewer from "react-native-image-zoom-viewer";
import DeletePopup from "./DeletePopup";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
//import AudioRecorderPlayer from "react-native-audio-recorder-player";
// import { createSound } from 'react-native-nitro-sound';
import LottieView from "lottie-react-native";
import Deleteicon from "../../Assets/icons/delete.svg";
import RNFS, { uploadFiles } from "react-native-fs";
import Slider from "@react-native-community/slider";
import Playicon from "react-native-vector-icons/Ionicons";
import NativeAudioRecorder from "../../../src/native/NativeAudioRecorder";

//const audioRecorderPlayer = new AudioRecorderPlayer();
const audioRecorderPlayer = NativeAudioRecorder;
import profileImagePath, { localrandomindex, randomimages } from "../../Utilities/profileImages";
import { useTranslation } from 'react-i18next';
import UUID from 'react-native-uuid';
import { KeyboardTrackingView } from "react-native-keyboard-tracking-view";
import Swipedown from 'react-native-vector-icons/FontAwesome'
import { GestureHandlerRootView, LongPressGestureHandler, State, Swipeable, TapGestureHandler } from "react-native-gesture-handler";
import Sound from 'react-native-sound';
import Clockicon from 'react-native-vector-icons/AntDesign'
import { showwarningmessage } from "../../Actions/config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Dowloadicon from "react-native-vector-icons/AntDesign"
import Icon from 'react-native-vector-icons/FontAwesome6';
import {
    KeyboardStickyView,
    KeyboardController,
    AndroidSoftInputModes,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getChatInstanceId,
    getReadReceiptKeys,
    getOtherChatMember,
    isGroupChatEvent,
    isGroupChatMember,
    isMessageReadByPeer,
    markOutgoingMessagesSeenBy,
    memberMatchesUserId,
    normalizeChatUserId,
    normalizeMemberIds,
    shouldClearTypingIndicator,
    shouldShowTypingInChat,
} from "../../Utilities/chatNavigation";
//import { KeyboardProvider } from 'react-native-keyboard-controller';
Sound.setCategory('Playback');

export default function ChatGroup(props) {

    const { t } = useTranslation();
    const { chatMembersList, isOnline, singleChatMembersList } = useSelector(helperSelector)
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const isChatFocused = useIsFocused();
    const dispatch = useDispatch();

    useFocusEffect(
        React.useCallback(() => {
            dispatch(update_statusbarcolor(c.primary));
            if (Platform.OS === "android") {
                KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING);
            }

            return () => {
                if (Platform.OS === "android") {
                    KeyboardController.setDefaultMode();
                }
                dispatch(update_SingleOrderChatMembersList(detil?._id));
                dispatch(update_ChatMembersOrderList(detil?._id));
                dispatch(update_EventChatOrderList(detil?._id));
            };
        }, [])
    );

    const [userBlocked, setUserBlocked] = useState(false);
    const scrollViewRef = useRef(null);
    const systemOverlayActiveRef = useRef(false);
    const { socket } = useContext(SocketContext);
    const User_Id = GetItem("UserId");
    const route = useRoute();
    const { detil, pageFrom, refreshKey } = route?.params || {};
    const [totalmembers, setTotalMembers] = useState(0);
    const [typing, setTyping] = useState(false);
    const [typinguser, setTypinguser] = useState("");
    const [page, setPage] = useState(1);
    const [mediaFile, setMediaFile] = useState();
    const [msgDelete, setMsgDelete] = useState([]);
    const [msgEdit, setMsgEdit] = useState([]);
    const [msgEvery, setMsgEvery] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imagePrevUrl, setImagePrevUrl] = useState([]);
    const [onlineSts, setOnlineSts] = useState(false);
    const [lastSeen, setLastSeen] = useState("");
    const [onlineCount, setOnlineCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [maxreached, setMaxreached] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const messageInputRef = useRef(null);
    const [replyMessage, setReplyMessage] = useState({});
    const [apiCalled, setApiCalled] = useState(false);
    const [voiceAct, setVoiceAct] = useState(false);

    useEffect(() => {
        if (mediaFile) {
            sendfn();
        }
    }, [mediaFile]);

    const [keyboardvisible, setKeyboardvisible] = useState(false)

    const scrollToLatestMessage = useCallback((animated = true) => {
        scrollViewRef.current?.scrollToOffset({ offset: 0, animated });
    }, []);

    useEffect(() => {
        const scrollAfterKeyboard = () => {
            scrollToLatestMessage(false);
            requestAnimationFrame(() => scrollToLatestMessage(true));
            setTimeout(() => scrollToLatestMessage(true), 120);
            setTimeout(() => scrollToLatestMessage(true), 280);
        };

        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const keyboardShowListener = Keyboard.addListener(
            showEvent,
            (event) => {
                setKeyboardvisible(true);
                setKeyboardHeight(event.endCoordinates.height);
                scrollAfterKeyboard();
            }
        );

        const keyboardHideListener = Keyboard.addListener(
            hideEvent,
            () => {
                setKeyboardvisible(false);
                setKeyboardHeight(0);
            }
        );

        return () => {
            setMaxreached(false);
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, [scrollToLatestMessage]);

    const releaseSystemOverlay = useCallback(() => {
        setTimeout(() => {
            systemOverlayActiveRef.current = false;
        }, 400);
    }, []);

    const dismissKeyboard = useCallback(() => {
        messageInputRef.current?.blur();
        Keyboard.dismiss();
    }, []);

    const [blockedBy, setBlockedBy] = useState(false);

    const handleUserBlocked = () => {

        if (!detil.isGroupchat) {

            const block = detil?.members[0]?._id;
            const userBlocked = profile?.userblocked?.includes(block)
            const blockedByuser = detil?.members[0]?.userblocked?.includes(profile?._id)

            if (userBlocked) {
                // ShowToast("This user blocked you")
                setUserBlocked(userBlocked)
            }

            setBlockedBy(blockedByuser);

            if (!blockedByuser && !blockedBy) {

                let getSeen = {
                    instanceId: detil?._id,
                    chatId: user_Id,
                }

                get_SeenData(getSeen);

                let seenData = {
                    chatId: user_Id,
                    instanceId: detil?._id,
                    status: true,
                };
                SeenUnseen(seenData);

                let payload = {
                    instanceId: detil?._id,
                    userId: user_Id,
                };

                MembersList(payload);
            }

        }
        else {
            let getSeen = {
                instanceId: detil?._id,
                chatId: user_Id,
            }

            get_SeenData(getSeen);

            let seenData = {
                chatId: user_Id,
                instanceId: detil?._id,
                status: true,
            };
            SeenUnseen(seenData);

            let payload = {
                instanceId: detil?._id,
                userId: user_Id,
            };

            MembersList(payload);
        }
    }

    const [members, setMembers] = useState([]);
    const [chatMembersState, setChatMembersState] = useState([]);
    const [edit, setEdit] = useState(false);
    const [messageId, setMessageId] = useState("");
    const [msgId, setMsgId] = useState("");
    const user_Id = GetItem("UserId");
    const socketID = GetItem("socketId");
    const [seen, setSeen] = useState(false);
    const [readReceiptEpoch, setReadReceiptEpoch] = useState(0);
    const readReceiptMapRef = useRef({});
    const [readReceiptMap, setReadReceiptMap] = useState({});
    const messageArrRef = useRef([]);
    const markReadDebounceRef = useRef(null);
    const { profile } = useSelector(profileSelector);
    const User_name = profile?.username;
    const typingTimeoutRef = useRef(null);
    const typingExpiryTimerRef = useRef(null);
    const chatFetchGenRef = useRef(0);
    const activeChatInstanceRef = useRef(null);
    const initialFetchInFlightRef = useRef(false);
    const messageCountRef = useRef(0);
    const [isTopReached, setIsTopReached] = useState(false);
    const apiTimeoutRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);
    const unsendArrayString = GetItem('UnSendMessage');
    const unsendArray = unsendArrayString?.length > 0 ? JSON.parse(unsendArrayString) : [];
    const [unSendMessageArr, setUnsendMessagesArr] = useState([])
    const [localMsg, setLocalMsg] = useState([]);
    const [msgEditItem, setMsgEditItem] = useState({})
    const [isReply, setIsReply] = useState(false);
    const [autoFocus, setAutoFocus] = useState(false);
    const memberSourceForHeader = useMemo(() => {
        if (chatMembersState?.length) {
            return chatMembersState;
        }
        return Array.isArray(detil?.members) ? detil.members : [];
    }, [chatMembersState, detil?.members]);

    const otherChatMember = useMemo(() => {
        if (detil?.isGroupchat) {
            return null;
        }
        return getOtherChatMember(memberSourceForHeader, user_Id);
    }, [detil?.isGroupchat, memberSourceForHeader, user_Id]);

    const loggedInProfilePath = profile?.profile;

    const displayChatName = detil?.isGroupchat
        ? detil?.chatName
        : otherChatMember?.username ||
          otherChatMember?.name ||
          detil?.username ||
          detil?.chatName ||
          'Chat';

    const displayChatProfile = useMemo(() => {
        if (detil?.isGroupchat) {
            return detil?.profile;
        }
        const peerProfile = otherChatMember?.profile;
        if (
            peerProfile &&
            (!loggedInProfilePath ||
                String(peerProfile) !== String(loggedInProfilePath))
        ) {
            return peerProfile;
        }
        const fallbackProfile = detil?.profile;
        if (
            fallbackProfile &&
            loggedInProfilePath &&
            String(fallbackProfile) === String(loggedInProfilePath)
        ) {
            return '';
        }
        return fallbackProfile || '';
    }, [detil?.isGroupchat, detil?.profile, otherChatMember?.profile, loggedInProfilePath]);

    const displayChatRandomIndex = !detil?.isGroupchat
        ? otherChatMember?.randomIndex ?? detil?.randomIndex
        : detil?.randomIndex;
    const resolveSingleChatOtherMember = useCallback((membersList) => {
        if (!Array.isArray(membersList) || detil?.isGroupchat) {
            return null;
        }

        return getOtherChatMember(membersList, user_Id);
    }, [detil?.isGroupchat, user_Id]);

    const chatMembersStateRef = useRef(chatMembersState);
    const otherChatMemberRef = useRef(otherChatMember);

    useEffect(() => {
        chatMembersStateRef.current = chatMembersState;
    }, [chatMembersState]);

    useEffect(() => {
        otherChatMemberRef.current = otherChatMember;
    }, [otherChatMember]);

    const mergeReadReceiptMap = useCallback((messagesToMerge, readerId) => {
        if (!Array.isArray(messagesToMerge) || messagesToMerge.length === 0) {
            return;
        }

        let changed = false;
        const nextMap = { ...readReceiptMapRef.current };

        messagesToMerge.forEach((message) => {
            const isRead = isMessageReadByPeer(
                message,
                readerId,
                user_Id,
                chatMembersStateRef.current?.length ? chatMembersStateRef.current : detil?.members,
                !!detil?.isGroupchat
            );

            if (!isRead) {
                return;
            }

            getReadReceiptKeys(message).forEach((key) => {
                if (!nextMap[key]) {
                    nextMap[key] = true;
                    changed = true;
                }
            });
        });

        if (changed) {
            readReceiptMapRef.current = nextMap;
            setReadReceiptMap(nextMap);
        }
    }, [detil?.isGroupchat, detil?.members, user_Id]);

    const clearRemoteTypingIndicator = useCallback(() => {
        clearTimeout(typingExpiryTimerRef.current);
        setTypinguser("");
    }, []);

    const emitStopTyping = useCallback(() => {
        clearTimeout(typingTimeoutRef.current);
        clearTimeout(typingExpiryTimerRef.current);

        if (!typing) {
            return;
        }

        setTyping(false);
        setTypinguser("");

        if (!detil?._id) {
            return;
        }

        StopTyping({
            name: User_name,
            id: String(user_Id),
            instanceId: String(detil?._id),
            group: detil?.chatName ? detil?.chatName : "",
            members: normalizeMemberIds(members),
        });
    }, [typing, User_name, user_Id, detil?._id, detil?.chatName, members]);

    useEffect(() => {

        if (!isOnline) return;

        handleUserBlocked();

        // const unsendArrayString = GetItem('UnSendMessage');
        // const unsendArray = unsendArrayString?.length > 0 ? JSON.parse(unsendArrayString) : [];
        // const local = unsendArray?.filter((msg) => msg?.instanceId == detil?._id)
        // setLocalMsg(local)

        // if (local?.length > 0) {
        //     setMessageArr(local)
        // }
        // setUnsendMessagesArr(unsendArray);
        return () => {
            handleStop()
        }
    }, [detil, isOnline]);  // Trigger the effect when 'isOnline' changes

    // useEffect(() => {
    //     if (unSendMessageArr?.length > 0 && isOnline) {
    //         getChatData();
    //     }
    // }, [unSendMessageArr, isOnline]);
    useEffect(() => {

        updateArray();
        dispatch(update_filterBySearch({ activeTab: pageFrom }))

        return () => {
            // Clear timeout if the component unmounts to avoid memory leaks
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (apiTimeoutRef.current) {
                clearTimeout(apiTimeoutRef.current);
            }
        };
    }, []);

    const updateArray = () => {
        if (detil) {
            const memberSource = Array.isArray(detil?.members) ? detil.members : [];
            setChatMembersState(memberSource);

            if (detil.isGroupchat) {
                // Ensure detil.members is an array before mapping
                const memberList = memberSource.map((data) => data?._id);

                setMembers(normalizeMemberIds(memberList));
            } else {
                // For non-group chat, add user_Id and detil._id
                const memberList = memberSource.map((data) => data?._id);

                setMembers(normalizeMemberIds(memberList));
                const other = resolveSingleChatOtherMember(memberSource);
                if (other) {
                    setOnlineSts(!!other?.online_status);
                    setLastSeen(other?.lastSeenDate ?? "");
                }
            }
        }
    };

    useEffect(() => {
        if (!detil?._id) {
            return;
        }

        const instanceId = detil._id;
        SetItem('ActiveChatInstanceId', String(instanceId));
        activeChatInstanceRef.current = instanceId;
        const fetchGen = ++chatFetchGenRef.current;
        clearChatNotification(instanceId);

        setPage(1);
        setMaxreached(false);
        setMessageArr([]);
        setLocalMsg([]);
        readReceiptMapRef.current = {};
        setReadReceiptMap({});
        setReadReceiptEpoch(0);
        setLoading(false);
        setFirstLoading(true);
        initialFetchInFlightRef.current = false;
        messageSet.current.clear();
        updateArray();

        if (!isOnline) {
            dispatch(update_NetworkVisible(true));
            return () => {
                REMOVE_ROOM({ instanceId, userId: user_Id });
                if (String(activeChatInstanceRef.current) === String(instanceId)) {
                    activeChatInstanceRef.current = null;
                }
            };
        }

        ensureSocketConnection(user_Id);
        getChatData({ page: 1, fetchGen, instanceId });
        JoinRoom(instanceId);
        updateAppPresence({ userId: user_Id, instanceId, active: true });

        return () => {
            updateAppPresence({ userId: user_Id, instanceId, active: false });
            REMOVE_ROOM({ instanceId, userId: user_Id });
            if (GetItem('ActiveChatInstanceId') === String(instanceId)) {
                RemoveItem('ActiveChatInstanceId');
            }
            if (String(activeChatInstanceRef.current) === String(instanceId)) {
                activeChatInstanceRef.current = null;
            }
        };
    }, [detil?._id, isOnline, refreshKey]);

    useEffect(() => {
        if (!detil?._id) {
            return;
        }

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            const isNowActive = nextAppState === 'active';
            const wasMinimized = appStateRef.current === "background";

            if (wasMinimized && isNowActive && isOnline) {
                const instanceId = detil?._id;

                if (systemOverlayActiveRef.current) {
                    appStateRef.current = nextAppState;
                    return;
                }

                const fetchGen = ++chatFetchGenRef.current;

                activeChatInstanceRef.current = instanceId;
                clearChatNotification(instanceId);
                setTypinguser("");
                setPage(1);
                setMaxreached(false);
                setFirstLoading(true);
                setMessageArr([]);
                setLocalMsg([]);
                readReceiptMapRef.current = {};
                setReadReceiptMap({});
                messageSet.current.clear();
                initialFetchInFlightRef.current = false;

                ensureSocketConnection(user_Id);
                JoinRoom(instanceId);
                updateAppPresence({ userId: user_Id, instanceId, active: true });
                getChatData({ page: 1, fetchGen, instanceId });
                get_SeenData({ instanceId, chatId: user_Id });
                SeenUnseen({ chatId: user_Id, instanceId, status: true });
                MembersList({ instanceId, userId: user_Id });
            } else if (!isNowActive) {
                const instanceId = detil?._id;
                emitStopTyping();
                setTypinguser("");
                if (instanceId) {
                    updateAppPresence({ userId: user_Id, instanceId, active: false });
                    SeenUnseen({ chatId: user_Id, instanceId, status: false });
                }
            }

            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [detil?._id, isOnline, user_Id, emitStopTyping]);

    // useFocusEffect(
    //     useCallback(() => {

    //         if (!socket) {
    //             return;
    //         }

    //         socket.on("messageResponse", (response) => {

    //             if (response?.instanceId?._id == detil?._id) {
    //                 if (!messageSet.current.has(response._id)) {
    //                     const memberList = Array.isArray(detil?.members)
    //                         ? detil?.members?.map((data) => data?._id)
    //                         : [];

    //                     const mem = memberList?.every(id => response?.instanceId?.joinMembers?.includes(id));

    //                     setSeen(mem);
    //                     messageSet.current.add(response._id); // Add the ID to the set
    //                     const unsendArrayString = GetItem('UnSendMessage');
    //                     const unsendArray = unsendArrayString?.length > 0 ? JSON.parse(unsendArrayString) : [];

    //                     // Remove the sent message from the unsend array using messageId
    //                     const updatedUnsendArray = unsendArray?.filter((msg) => msg?.messageId != response?.messageId);
    //                     setLocalMsg(updatedUnsendArray)

    //                     setMessageArr((prev) => {
    //                         const index = prev.findIndex((msg) => (msg?.messageId == response?.messageId));

    //                         if (index != -1) {
    //                             const updatedMessages = [...prev]; // Make a copy of the previous state
    //                             updatedMessages[index] = response;  // Replace the old message
    //                             return updatedMessages; // Return the updated array
    //                         } else {
    //                             return [...prev, response]; // Append if not found
    //                         }
    //                     });

    //                 }
    //             }

    //         });

    //         socket.on("TYPING", (data) => {
    //             setTypinguser(data);
    //         });

    //         socket.on("STOPTYPING", (data) => {
    //             setTypinguser("");
    //         });

    //         socket.on("deleteResponse_me", (data) => {
    //             setMessageArr((prev) =>
    //                 prev.map((message) => (message._id == data._id ? data : message))
    //             );
    //         });

    //         socket.on("deleteResponse_every", (data) => {
    //             setMessageArr((prev) =>
    //                 prev.map((message) => (message._id == data._id ? data : message))
    //             );
    //         });

    //         socket.on("SEEN_STATUS", (data) => {
    //             getChatData();
    //         });

    //         socket.on("NEW_MEMBERS_ADD", (response) => {
    //             getChatData();
    //         });


    //         socket.on("updateResponse", (data) => {
    //             setMessageArr((prev) =>
    //                 prev.map((message) => (message._id == data._id ? data : message))
    //             );
    //         });

    //         socket.on("messageId", (data) => {
    //             setMsgId(data);
    //         });

    //         socket.on("MEMBER_RESPONSE", (data) => {

    //             setTotalMembers(data?.length);
    //             const countOnlineUsers = data?.filter(
    //                 (member) => member.online_status
    //             ).length;

    //             setOnlineCount(countOnlineUsers + 1);
    //             // membersList = data?.map((e) => e.members);
    //             if (!detil?.isGroupchat) {
    //                 setOnlineSts(data[0]?.online_status);
    //                 setLastSeen(data[0]?.lastSeenDate)
    //             }
    //         });

    //         socket.on("READ_UNREAD", (data) => {
    //         });

    //         socket.on("ONLINE_OFFLINE", (data) => {
    //             if (detil?.isGroupchat) {
    //                 if (data?.userId && data?.userId !== "") {
    //                     const isMember = detil?.members?.some(
    //                         (memb) => memb?.id === data?.userId
    //                     );
    //                     if (isMember) {
    //                         if (data?.online_status) {
    //                             if (onlineCount < detil?.members.length) {
    //                                 setOnlineCount((prev) => prev + 1);
    //                             }
    //                         } else {
    //                             if (onlineCount > 0) {
    //                                 setOnlineCount((prev) => prev - 1);
    //                             }
    //                         }
    //                     }
    //                 }
    //             } else {
    //                 if (data?.userId && data?.userId !== "") {
    //                     const isMember = detil?.members?.some(
    //                         (memb) => memb?.id === data?.userId
    //                     );
    //                     if (isMember) {
    //                         setOnlineSts(data?.online_status);
    //                         setLastSeen(data?.resp?.lastSeenDate)
    //                     }
    //                 }
    //             }
    //         });

    //         return () => {

    //             if (!blockedBy) {
    //                 let getSeen = {
    //                     instanceId: detil?._id,
    //                     chatId: user_Id,
    //                 }

    //                 get_SeenData(getSeen);

    //                 let seenData = {
    //                     chatId: user_Id,
    //                     instanceId: detil?._id,
    //                     status: false,
    //                 };
    //                 SeenUnseen(seenData);
    //             }
    //         };
    //     }, [socket])
    // );

    useEffect(() => {
        if (!isChatFocused || !detil?._id) {
            return undefined;
        }

        const instanceId = String(detil._id);
        const activeSocket = socket || socketClient;

        const refreshPresence = () => {
            ensureSocketConnection(user_Id);
            JoinRoom(instanceId);
            MembersList({ instanceId, userId: user_Id });
        };

        const leaveChatPresence = () => {
            emitStopTyping();
            clearRemoteTypingIndicator();
            updateAppPresence({ userId: user_Id, instanceId, active: false });
            if (!blockedBy) {
                get_SeenData({ instanceId, chatId: user_Id });
                SeenUnseen({ chatId: user_Id, instanceId, status: false });
            }
        };

        const applyReadReceiptsForReader = (readerId) => {
            if (!readerId) {
                return;
            }

            const normalizedReader = normalizeChatUserId(readerId);
            const memberSource = chatMembersStateRef.current?.length
                ? chatMembersStateRef.current
                : detil?.members;

            if (detil?.isGroupchat) {
                if (!isGroupChatMember(readerId, memberSource)) {
                    return;
                }
            } else {
                const otherId = normalizeChatUserId(otherChatMemberRef.current?._id);
                if (otherId && normalizedReader !== otherId) {
                    return;
                }
            }

            setMessageArr((prev) => {
                const next = markOutgoingMessagesSeenBy(prev, readerId, user_Id);
                mergeReadReceiptMap(next, readerId);
                return next === prev ? prev : next;
            });
            setReadReceiptEpoch((epoch) => epoch + 1);
        };

        const scheduleMarkMessagesRead = () => {
            if (blockedBy) {
                return;
            }

            clearTimeout(markReadDebounceRef.current);
            markReadDebounceRef.current = setTimeout(() => {
                get_SeenData({ instanceId, chatId: user_Id });
            }, 600);
        };

        const onMessageResponse = (response) => {
            const responseInstanceId = String(
                response?.instanceId?._id ?? response?.instanceId ?? ''
            );
            if (responseInstanceId !== instanceId) {
                return;
            }
            if (messageSet.current.has(response._id)) {
                return;
            }

            const senderId = normalizeChatUserId(
                response?.chatId ??
                response?.resp?.chatId ??
                response?.data?.chatId
            );
            const isIncoming = senderId !== normalizeChatUserId(user_Id);

            if (isIncoming && !blockedBy) {
                if (!detil?.isGroupchat) {
                    setOnlineSts(true);
                    setChatMembersState((prev) =>
                        Array.isArray(prev)
                            ? prev.map((member) =>
                                memberMatchesUserId(member, senderId)
                                    ? { ...member, online_status: true }
                                    : member
                            )
                            : prev
                    );
                }
                scheduleMarkMessagesRead();
            }

            const memberList = Array.isArray(detil?.members)
                ? detil.members.map((data) => data?._id)
                : [];

            const mem = memberList.every((id) =>
                response?.instanceId?.joinMembers?.includes(id)
            );

            setSeen(mem);
            messageSet.current.add(response._id);

            const unsendArrayString = GetItem('UnSendMessage');
            const unsendArray =
                unsendArrayString?.length > 0
                    ? JSON.parse(unsendArrayString)
                    : [];

            const updatedUnsendArray = unsendArray.filter(
                (msg) => msg?.messageId !== response?.messageId
            );
            setLocalMsg(updatedUnsendArray);

            setMessageArr((prev) => {
                const index = prev.findIndex(
                    (msg) => msg?.messageId === response?.messageId
                );
                if (index !== -1) {
                    const updated = [...prev];
                    const previous = updated[index];
                    updated[index] = {
                        ...response,
                        seenStatus: response?.seenStatus ?? previous?.seenStatus,
                    };
                    return updated;
                }
                return [...prev, response];
            });
        };

        const onTyping = (data) => {
            if (!shouldShowTypingInChat(data, detil?._id, user_Id)) {
                return;
            }

            if (!detil?.isGroupchat) {
                setOnlineSts(true);
            }

            setTypinguser({
                ...data,
                instanceId: data?.instanceId || detil?._id,
            });

            clearTimeout(typingExpiryTimerRef.current);
            typingExpiryTimerRef.current = setTimeout(() => {
                clearRemoteTypingIndicator();
            }, 5000);
        };

        const onStopTyping = (data) => {
            clearTimeout(typingExpiryTimerRef.current);
            setTypinguser((prev) =>
                shouldClearTypingIndicator(prev, data, detil?._id) ? '' : prev
            );
        };

        const onDeleteMe = (data) =>
            setMessageArr((prev) =>
                prev.map((msg) => (
                    msg._id === data._id
                        ? { ...msg, ...data, seenStatus: data?.seenStatus ?? msg?.seenStatus }
                        : msg
                ))
            );

        const onDeleteEvery = (data) =>
            setMessageArr((prev) =>
                prev.map((msg) => (
                    msg._id === data._id
                        ? { ...msg, ...data, seenStatus: data?.seenStatus ?? msg?.seenStatus }
                        : msg
                ))
            );

        const onSeenStatus = (data) => {
            const eventInstanceId = getChatInstanceId(data);
            if (eventInstanceId && eventInstanceId !== instanceId) {
                return;
            }

            if (data?.resp === 'No updates needed') {
                return;
            }

            setSeen(true);

            const readerId =
                data?.chatId ??
                data?.readerId ??
                (!detil?.isGroupchat ? otherChatMemberRef.current?._id : null);

            applyReadReceiptsForReader(readerId);
        };

        const onNewMembersAdd = (data) => {
            if (!detil?.isGroupchat) {
                return;
            }

            const eventInstanceId = getChatInstanceId(data);
            if (eventInstanceId && eventInstanceId !== instanceId) {
                return;
            }
            if (data && !isGroupChatEvent(data)) {
                return;
            }

            MembersList({ instanceId, userId: user_Id });
        };

        const onUpdateResponse = (data) =>
            setMessageArr((prev) =>
                prev.map((msg) => (
                    msg._id === data._id
                        ? { ...msg, ...data, seenStatus: data?.seenStatus ?? msg?.seenStatus }
                        : msg
                ))
            );

        const onMessageId = (data) => setMsgId(data);

        const onMemberResponse = (data) => {
            setChatMembersState(Array.isArray(data) ? data : []);
            setTotalMembers(data?.length);
            const countOnline = data?.filter((m) => m.online_status).length;
            setOnlineCount(countOnline);

            if (!detil?.isGroupchat) {
                const other = resolveSingleChatOtherMember(data);
                if (other) {
                    setOnlineSts(!!other?.online_status);
                    setLastSeen(other?.lastSeenDate ?? "");
                }
            }
        };

        const onOnlineOffline = (data) => {
            if (!data?.userId) {
                return;
            }

            const memberSource = chatMembersStateRef.current?.length
                ? chatMembersStateRef.current
                : detil?.members;
            const isMember = memberSource?.some((memb) =>
                memberMatchesUserId(memb, data?.userId)
            );
            if (!isMember) {
                return;
            }

            if (data?.online_status === false) {
                setTypinguser((prev) => {
                    if (!prev) {
                        return prev;
                    }
                    if (data?.forceClear) {
                        return '';
                    }
                    const typingUserId = prev?.id ?? prev?._id;
                    if (
                        typingUserId &&
                        String(typingUserId) === String(data.userId)
                    ) {
                        return '';
                    }
                    return prev;
                });
            }

            if (detil?.isGroupchat) {
                if (data?.userId && String(data.userId) !== String(user_Id)) {
                    MembersList({ instanceId, userId: user_Id });
                }
            } else {
                setOnlineSts(!!data?.online_status);
                setLastSeen(data?.resp?.lastSeenDate ?? "");
                setChatMembersState((prev) =>
                    Array.isArray(prev)
                        ? prev.map((member) =>
                            memberMatchesUserId(member, data?.userId)
                                ? {
                                    ...member,
                                    online_status: data?.online_status,
                                    lastSeenDate:
                                        data?.resp?.lastSeenDate ??
                                        member?.lastSeenDate,
                                  }
                                : member
                          )
                        : prev
                );
            }
        };

        const onSocketConnect = () => {
            refreshPresence();
        };

        refreshPresence();

        const unsubs = [
            subscribeChatSocket('messageResponse', onMessageResponse),
            subscribeChatSocket('TYPING', onTyping),
            subscribeChatSocket('STOPTYPING', onStopTyping),
            subscribeChatSocket('deleteResponse_me', onDeleteMe),
            subscribeChatSocket('deleteResponse_every', onDeleteEvery),
            subscribeChatSocket('SEEN_STATUS', onSeenStatus),
            subscribeChatSocket('NEW_MEMBERS_ADD', onNewMembersAdd),
            subscribeChatSocket('updateResponse', onUpdateResponse),
            subscribeChatSocket('messageId', onMessageId),
            subscribeChatSocket('MEMBER_RESPONSE', onMemberResponse),
            subscribeChatSocket('ONLINE_OFFLINE', onOnlineOffline),
        ];

        activeSocket?.on?.('connect', onSocketConnect);

        return () => {
            unsubs.forEach((unsubscribe) => unsubscribe());
            activeSocket?.off?.('connect', onSocketConnect);
            clearTimeout(typingExpiryTimerRef.current);
            clearTimeout(markReadDebounceRef.current);
            leaveChatPresence();
        };
    }, [
        isChatFocused,
        socket,
        detil?._id,
        detil?.isGroupchat,
        detil?.members,
        detil?.chatName,
        user_Id,
        blockedBy,
        emitStopTyping,
        clearRemoteTypingIndicator,
        mergeReadReceiptMap,
    ]);

    const getChatData = async (options = {}) => {
        const pageNum = options.page ?? page;
        const fetchGen = options.fetchGen;
        const instanceId = options.instanceId ?? detil?._id;
        const isTrackedInitialFetch = pageNum === 1 && fetchGen != null;
        let fetchedMessageCount = 0;

        try {
            if (!instanceId) {
                return;
            }
            if (!isOnline) {
                dispatch(update_NetworkVisible(true));
                return;
            }
            if (isTrackedInitialFetch) {
                if (initialFetchInFlightRef.current) {
                    return;
                }
                initialFetchInFlightRef.current = true;
                setFirstLoading(true);
            } else if (loading) {
                return;
            }

            setLoading(true);
            clearTimeout(apiTimeoutRef.current);

            if (pageNum > 1 && maxreached) {
                return;
            }

            const payload = {
                instanceId,
                userId: user_Id,
                page: pageNum,
                limit: 20,
            };

            const result = await getChatDataList(payload);

            const isStaleFetch =
                fetchGen != null &&
                (fetchGen !== chatFetchGenRef.current ||
                    String(activeChatInstanceRef.current) !== String(instanceId));

            if (isStaleFetch) {
                return;
            }

            const data = result?.data;
            fetchedMessageCount = Array.isArray(data) ? data.length : 0;

            if (!detil?.isGroupchat) {
                setBlockedBy(!!result?.blocked);
            }

            if (result?.data?.length == 0) {
                if (pageNum === 1) {
                    setMessageArr([]);
                }
                setMaxreached(true);
            } else if (result?.status) {
                const unsendArrayString = GetItem('UnSendMessage');
                const unsendArray =
                    unsendArrayString?.length > 0 ? JSON.parse(unsendArrayString) : [];
                const local = unsendArray?.filter((msg) => msg?.instanceId == instanceId);
                setLocalMsg(local);

                const normalizedRemoteMessages = normalizeChatMessages(data);
                const nextMessages = local?.length > 0
                    ? normalizeChatMessages([...local, ...normalizedRemoteMessages])
                    : normalizeChatMessages(normalizedRemoteMessages);
                setMessageArr(nextMessages);
                mergeReadReceiptMap(nextMessages, otherChatMemberRef.current?._id);
                setReadReceiptEpoch((epoch) => epoch + 1);

                setPage(pageNum);
                setMaxreached(false);
            }
        } catch (e) {
        } finally {
            const isCurrentFetch =
                fetchGen == null ||
                (fetchGen === chatFetchGenRef.current &&
                    String(activeChatInstanceRef.current) === String(instanceId));

            if (isTrackedInitialFetch) {
                initialFetchInFlightRef.current = false;
            }

            if (pageNum === 1 && isCurrentFetch && fetchedMessageCount === 0) {
                setFirstLoading(false);
            }
            if (isCurrentFetch) {
                setLoading(false);
            }
        }
    };

    const handleTexttype = async (e) => {
        try {

            let trimmedMessage = e.replace(/^\s+/, '');

            if (trimmedMessage === '') {
                setMessage(''); // Allow state to be empty
                return;
            }

            setMessage(trimmedMessage);

            if (!typing) {
                setTyping(true);

                let payload = {
                    name: User_name,
                    id: String(user_Id),
                    instanceId: String(detil?._id),
                    members: normalizeMemberIds(members),
                    group: detil?.chatName ? detil?.chatName : "",
                };

                HandleTyping(payload);
            }

            // Clear any existing timer before setting a new one
            clearTimeout(typingTimeoutRef.current);

            // Set a new timer to stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                emitStopTyping();
            }, 1000);
        } catch (error) {

        }
    };

    const [message, setMessage] = useState('');
    const [chatarray, setChatarray] = useState([]);
    const [flag, setFlag] = useState(false);
    const [replyMessageId, setReplyMessageId] = useState("");

    const [messageArr, setMessageArr] = useState([]);
    messageCountRef.current = messageArr.length;
    messageArrRef.current = messageArr;
    const showMessageLoader =
        firstLoading ||
        (Boolean(detil?._id) && messageArr.length === 0 && (loading || !isOnline));

    useEffect(() => {
        if (firstLoading && messageArr.length > 0) {
            requestAnimationFrame(() => {
                setFirstLoading(false);
            });
        }
    }, [firstLoading, messageArr.length]);

    useFocusEffect(
        React.useCallback(() => {
            if (pageFrom !== 'Notification' || !detil?._id || !isOnline) {
                return undefined;
            }

            const instanceId = detil._id;
            const retryTimer = setTimeout(() => {
                if (
                    messageCountRef.current > 0 ||
                    initialFetchInFlightRef.current
                ) {
                    return;
                }

                setFirstLoading(true);
                const fetchGen = ++chatFetchGenRef.current;
                activeChatInstanceRef.current = instanceId;
                ensureSocketConnection(user_Id);
                getChatData({ page: 1, fetchGen, instanceId });
            }, 350);

            return () => clearTimeout(retryTimer);
        }, [detil?._id, isOnline, refreshKey, pageFrom, user_Id]),
    );
    const messageSet = useRef(new Set());
    const [apipayload, setApipayload] = useState("")
    //useEffect for apicall 
    useEffect(() => {
        if (apipayload) {



            // return;

            async function senddata() {

                const result = await createMessage(apipayload);

                if (result?.status) {

                    setReplyMessage({})
                    setRecordedFilePath("");
                    setIsRecording(false);
                    setMediaFile(null);
                    setLoading(false);
                    setApipayload("")
                    setMsgEditItem({})
                }
            }

            async function sendSocket(data) {
                try {
                    await CREATEMESSAGE(data);
                    setMsgEditItem({})
                    setReplyMessage({})
                    setApipayload("")
                } catch (error) {
                    showwarningmessage(error?.message || "Unable to send message");
                    setApipayload("")
                }
            }

            if (apipayload?.voicerecord?.length > 0 || apipayload?.file?.length > 0) {

                if (pageFrom == "Chat") {
                    // dispatch(update_FetchChat(apipayload?.messageId))
                    // dispatch(update_ChatFilterHoobies([]))
                    // dispatch(GetAllchat(1))
                }
                else {
                    dispatch(update_SingleFetchChat(apipayload?.messageId))
                }

                senddata()

            }
            else {
                sendSocket(apipayload)
            }
        }
    }, [apipayload])

    const sendfn = async (audio) => {
        try {

            const messageId = UUID.v4();

            const sendData = {
                chatId: user_Id,
                instanceId: detil?._id,
                text: message,
                messageId: messageId,
                replyMsgId: replyMessage?._id
            };
            setMessage("");
            setReplyMessage({})


            // Append media files or voice recordings if present
            if (mediaFile) {
                let Arr = []
                setLoading(true);

                mediaFile.forEach((item) => {
                    Arr.push({
                        uri: Platform.OS === "android" ? item?.uri : item?.uri?.replace("file://", ""),
                        type: item?.type === "image/jpg" ? "image/jpeg" : item?.type,
                        name: item?.fileName,
                    });

                });
                sendData.file = Arr

            } else if (audio) {
                setLoading(true);

                const realPath = await RNFS.stat(audio);
                const fileExtension = realPath?.path.split('.').pop();
                let mimeType = 'audio/m4a'; // Default to 'audio/m4a'

                if (fileExtension === 'mp3') {
                    mimeType = 'audio/mp3';
                } else if (fileExtension === 'wav') {
                    mimeType = 'audio/wav';
                }

                sendData.voicerecord = [{
                    uri: Platform.OS === "android"
                        ? `file://${realPath.path}`   // 🔥 VERY IMPORTANT
                        : realPath.path.replace("file://", ""),
                    name: "test.m4a",
                    type: mimeType,
                }];


                // setLoading(true);

                // const formData = new FormData();

                // formData.append("chatId", sendData.chatId);
                // formData.append("instanceId", sendData.instanceId);
                // formData.append("messageId", sendData.messageId);

                // formData.append("voicerecord", {
                //     uri: Platform.OS === "android"
                //         ? `file://${realPath.path}`   // 🔥 VERY IMPORTANT
                //         : realPath.path.replace("file://", ""),
                //     name: "test.m4a",
                //     type: mimeType,
                // });

                // axios.post("YOUR_API_URL", formData, {
                //     headers: {
                //         "Content-Type": "multipart/form-data",
                //     },
                // });

            }

            // Clear message state
            //localstorage---------------------------------------------------------------------------
            const unsendArrayString = GetItem('UnSendMessage');
            const unsendArray = unsendArrayString?.length > 0 ? JSON.parse(unsendArrayString) : [];


            if (mediaFile) {
                const createdAt = new Date().toISOString();


                const newObj = {
                    chatId: {
                        _id: user_Id,
                        name: User_name,
                        profile: profile?.profile,
                    },
                    instanceId: detil?._id,
                    messageId: messageId,
                    groupmembers: [user_Id],
                    msgType: "local",
                    text: "",
                    voicerecord: [],
                    file: mediaFile?.map((data) => {
                        return {
                            uri: Platform.OS === "android" ? data?.uri : data?.uri?.replace("file://", ""),
                            type: data?.type === "image/jpg" ? "image/jpeg" : data?.type,
                            name: data?.fileName,
                        }
                    }
                    ),
                    uploadFile: {
                        status: true,
                    },
                    createdAt: createdAt,
                    replyMessage: replyMessage?._id ? replyMessage : {},
                };


                setMessageArr((prev) => [
                    ...prev,
                    newObj,
                ]);

                const data = [...unsendArray, newObj];
                const updatedArray = JSON.stringify(data);

            }
            else if (sendData?.text) {
                const createdAt = new Date().toISOString();

                const newObj = {
                    chatId: {
                        _id: user_Id,
                        name: User_name,
                        profile: profile?.profile,
                    },
                    instanceId: detil?._id,
                    groupmembers: [user_Id],
                    text: sendData?.text,
                    msgType: "local",
                    file: [],
                    voicerecord: [],
                    messageId: messageId,
                    uploadText: {
                        status: true,
                    },
                    createdAt: createdAt,
                    replyMessage: replyMessage?._id ? replyMessage : {}
                }


                setMessageArr((prev) => [
                    ...prev,
                    newObj,
                ]);

                const data = [...unsendArray, newObj];
                const updatedArray = JSON.stringify(data);
            }
            else if (audio) {

                const createdAt = new Date().toISOString();

                const realPath = await RNFS.stat(audio);

                const fileExtension = realPath?.path.split('.').pop();

                let mimeType = 'audio/m4a'; // Default to 'audio/m4a'

                if (fileExtension === 'mp3') {
                    mimeType = 'audio/mp3';
                } else if (fileExtension === 'wav') {
                    mimeType = 'audio/wav';
                }


                const newObj = {
                    chatId: {
                        "_id": user_Id,
                        "name": User_name,
                        "profile": profile?.profile
                    },
                    instanceId: detil?._id,
                    groupmembers: [user_Id],
                    messageId: messageId,
                    text: "",
                    msgType: "local",
                    file: [],
                    voicerecord: [{
                        uri: realPath?.path,
                        name: "test.m4a",
                        type: mimeType,
                    }],
                    uploadAudioFile: {
                        status: true
                    },
                    createdAt: createdAt,
                    replyMessage: replyMessage?._id ? replyMessage : {}
                }


                setMessageArr((prev) =>
                    [...prev,
                        newObj,
                    ]);

                const data = [...unsendArray, newObj];

                const updatedArray = JSON.stringify(data);
            }

            setMediaFile()

            if (!isOnline) {
                // dispatch(update_NetworkVisible(true));
                return
            }

            if (!mediaFile && !audio && !socket?.connected) {
                ensureSocketConnection(user_Id);
                showwarningmessage("Chat is reconnecting. Please try again.");
                return;
            }
            setApipayload(sendData)



        } catch (error) {
            setLoading(false);
        }
    };

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
    }

    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const updateRowRef = useRef({});
    const normalizeChatMessages = useCallback((messages) => {
        if (!Array.isArray(messages)) {
            return [];
        }

        const uniqueMessages = [];
        const seenIds = new Set();

        messages.forEach((message) => {
            if (!message) {
                return;
            }

            const stableId = String(
                message?._id ??
                message?.messageId ??
                `${message?.createdAt ?? ""}-${message?.chatId?._id ?? message?.chatId ?? ""}`
            );

            if (seenIds.has(stableId)) {
                return;
            }

            seenIds.add(stableId);
            uniqueMessages.push({
                ...message,
                isfocusdelete: message?.isfocusdelete ?? false,
            });
        });

        return uniqueMessages.sort(
            (a, b) => new Date(a?.createdAt ?? 0) - new Date(b?.createdAt ?? 0)
        );
    }, []);

    const shouldRenderChatItem = useCallback((item) => {
        if (!item) {
            return false;
        }

        if (item?.messageData) {
            return true;
        }

        const members = normalizeMemberIds(item?.groupmembers);
        if (members.length === 0) {
            return true;
        }

        return members.includes(String(user_Id));
    }, [user_Id]);

    const handleScroll = (event) => {

        if (maxreached) {
            return;
        }

        if (!isOnline) {
            // dispatch(update_NetworkVisible(true));
            return
        }
        RenderPage();

    };


    const capturescroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        // Show button if the user scrolls near the top
        if (offsetY <= 50) {
            setShowScrollButton(false); // Show button near the top
        } else {
            setShowScrollButton(true); // Hide button when scrolling away
        }
    };


    const scrollToEnd = () => {
        setShowScrollButton(false)
        scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day} ${getMonthName(date.getMonth())} ${year}`;
    };

    const getMonthName = (monthIndex) => {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        return months[monthIndex];
    };


    const groupMessagesByDate = (messages) => {
        const orderedMessages = [...messages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        return orderedMessages.reduce((acc, message) => {
            try {
                const messageDate = new Date(message.createdAt);
                if (isNaN(messageDate.getTime())) {
                    throw new Error(t('Invalid_date_message'));
                }

                const now = new Date();
                const isToday = messageDate.toDateString() === now.toDateString();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const isYesterday = messageDate.toDateString() === yesterday.toDateString();

                const dateKey = isToday
                    ? t('Today')
                    : isYesterday
                        ? t('Yesterday')
                        : formatDate(messageDate);

                // Initialize the array for this date if it doesn't exist
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(message);
                return acc;

            } catch (error) {
                return acc; // Skip this message and continue
            }
        }, {});
    };


    const groupedMessages = groupMessagesByDate(messageArr);

    //pagination

    const RenderPage = async () => {

        clearTimeout(apiTimeoutRef.current);

        // Set a new timer to stop typing after 2 seconds of inactivity
        apiTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
        }, 5000);


        if (isLoading) {
            return;
        }

        setIsLoading(true);
        setIsTopReached(true);

        try {
            await AppendChatData(page + 1); // Assuming this is an async function
        } catch (error) {
        } finally {

            setIsLoading(false);
            setIsTopReached(false);
        }
    };

    const [paginationloader, setPaginationloader] = useState(false)

    const AppendChatData = async (page) => {
        try {

            if (loading) return; // Prevent further calls if one is already in progress
            setLoading(true);

            if (!maxreached) {
                setPaginationloader(true)
                let payload = {
                    instanceId: detil?._id,
                    userId: user_Id,
                    page: page,
                    limit: 20,
                };

                const result = await getChatDataList(payload);
                const data = result?.data;
                if (result?.status) {
                    setPaginationloader(false)

                    if (result?.data?.length == 0) {
                        setMaxreached(true);
                    }
                    else {

                        if (result?.status && Array.isArray(data)) {
                            setShouldAutoScroll(false);
                            const normalizedOlderMessages = normalizeChatMessages(data);
                            setMessageArr((prev) => {
                                const mergedMessages = normalizeChatMessages([
                                    ...normalizedOlderMessages,
                                    ...prev,
                                ]);
                                mergeReadReceiptMap(mergedMessages, otherChatMemberRef.current?._id);
                                return mergedMessages;
                            });
                            setPage(page);
                        }
                    }
                }
                else {
                    setMaxreached(true)
                    setIsLoading(false);
                    setPaginationloader(false)
                }
            }

        } catch (e) {
            setPaginationloader(false)
        }
        finally {
            setIsLoading(false);
            setPaginationloader(false)
            setLoading(false);
        }

    };

    const onMessageEdit = async () => {
        try {

            let payload = {
                member: JSON.stringify(members),
                messageid: messageId,
                text: message,
            };

            const result = await editMessage(payload);

            if (result?.status) {
                setSelectMes(false);
                setMessageId("");
                setMessage("");
                setEdit(false);
            } else {
                setEdit(false);
                setMessageId("");
                setMessage("");
                setSelectMes(false);
            }

        } catch (error) {
            // Optionally: Show a user-friendly message or handle the error accordingly
        }
    };

    const onMessageDeleteforMe = async () => {
        try {

            let msgdelId = msgDelete.map((user) => user._id);
            let payload = {
                memberid: JSON.stringify(members),
                id: JSON.stringify(msgdelId),
                delteperson: user_Id,
                action: "me",
            };

            const result = await deleteMessage(payload);
            setMsgDelete([]);

            if (result?.status) {
                setSelectMes(false);
                setMsgArray([]);

            }
        } catch (error) {

        }
    };

    const onMessageDeleteforEveryone = async () => {
        try {

            let msgdelId = msgDelete.map((user) => user._id);
            let payload = {
                memberid: JSON.stringify(members),
                id: JSON.stringify(msgdelId),
                delteperson: user_Id,
                action: "every",
            };

            const result = await deleteMessage(payload);
            setMsgDelete([]);
            if (result?.status) {
                setSelectMes(false);
                setMsgArray([]);
            }
        } catch (error) {
        }
    };

    const [highlighted, setHighlighted] = useState(false);
    const [modalVisible, setModalVisible] = useState("");
    const [selectMes, setSelectMes] = useState(false);
    const [msgArray, setMsgArray] = useState([]);

    const handleLongPress = (e) => {
        var getdata = [...messageArr];

        setReplyMessageId(e?._id);

        setMsgArray((prev) => {
            const newId = e?._id;
            // Check if the ID already exists in the array
            if (prev.includes(newId)) {
                // Remove the ID
                return prev.filter(id => id !== newId);
            } else {
                // Add the ID
                return [...prev, newId];
            }
        });

        const msgID = e?._id
        const index = getdata.findIndex(item => item?._id === msgID);

        if (index != -1) {
            getdata[index].isfocusdelete = !getdata[index].isfocusdelete;
            setMessageArr(getdata);

            setMsgEdit((prev) => {
                const itemToCheck = getdata[index];
                const itemId = itemToCheck._id;

                // Check if the item already exists in the array
                const itemExists = prev.some((item) => item._id === itemId);

                if (itemExists) {
                    // Remove the item if it already exists
                    const newArray = prev.filter((item) => item._id !== itemId);
                    // Check if any chatId is not equal to userId
                    const allUserMessages = newArray.every(
                        (item) => item.chatId?._id === user_Id
                    );
                    setMsgEvery(allUserMessages);
                    return newArray;
                } else {
                    // Add the item if it does not exist
                    const newArray = [...prev, itemToCheck];
                    // Check if any chatId is not equal to userId
                    const allUserMessages = newArray.every(
                        (item) => item.chatId?._id === user_Id
                    );
                    setMsgEvery(allUserMessages);
                    return newArray;
                }
            });

            setMsgDelete((prev) => {
                const itemToCheck = getdata[index];
                const itemId = itemToCheck._id;
                const itemExists = prev.some((item) => item._id === itemId);

                if (itemExists) {
                    // Remove the item if it already exists
                    return prev.filter((item) => item._id !== itemId);
                } else {
                    // Add the item if it does not exist
                    return [...prev, itemToCheck];
                }
            });

            var result = getdata?.find((e) => e?.isfocusdelete);
            setSelectMes(result ? true : false);

        }
    };

    const handleImagePreview = async (fileName, path) => {
        const imageObjects = fileName.map((fileNames) => ({
            url: `${path}${fileNames}`,
        }));
        // Update the state
        setImagePrevUrl((prev) => [...prev, ...imageObjects]);
        setIsModalVisible(true);
    };

    //voice message
    const [isRecording, setIsRecording] = useState(false);

    const composerBlockHeight = useMemo(() => {
        const hasReply =
            replyMessage?.text ||
            replyMessage?.voicerecord?.length ||
            replyMessage?.file?.length;
        if (isRecording) {
            return 130;
        }
        if (hasReply) {
            return 110;
        }
        return 72;
    }, [isRecording, replyMessage]);

    const listBottomPadding = useMemo(() => {
        const keyboardPad = keyboardvisible ? keyboardHeight : 0;
        return composerBlockHeight + keyboardPad + 8;
    }, [composerBlockHeight, keyboardvisible, keyboardHeight]);

    const Mediafn = useCallback(async (type) => {
        dismissKeyboard();
        systemOverlayActiveRef.current = true;
        try {
            const res = await Imagepicker(type);

            if (res?.length < 5) {
                setMediaFile(res);
            } else if (res?.length >= 5) {
                showwarningmessage(t('Accept_limited_images'));
                setMediaFile(res?.slice(0, 4));
            }
        } finally {
            releaseSystemOverlay();
        }
    }, [t, releaseSystemOverlay, dismissKeyboard]);

    const [recordTime, setRecordTime] = useState("0:00");
    const [recordedFilePath, setRecordedFilePath] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingPR, setIsPlayingPR] = useState(false);
    const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
    const [durationSec, setDurationSec] = useState(0);
    const [currentPositionSec, setCurrentPositionSec] = useState(0);
    const audioPlayer = useRef(null);
    const progressInterval = useRef(null);
    const [showPreview, setShowPreview] = useState(false); // New


    const requestMicrophonePermission = async () => {
        try {
            let result;
            if (Platform.OS === "android") {
                result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
            } else if (Platform.OS === "ios") {
                result = await request(PERMISSIONS.IOS.MICROPHONE);
            }
            if (result === RESULTS.GRANTED) {
                return true;
            }
            if (result === RESULTS.BLOCKED) {
                showPermissionAlert();
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    const showPermissionAlert = () => {
        Alert.alert(
            t('MicrophonePermissionRequired'),
            t('Please_enable_microphone_access'),
            [
                {
                    text: t('Cancel')
                },
                {
                    text: t('Ok'),
                    onPress: () => {
                        openSettings()
                    }
                }
            ]
        );
    };

    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else if (Platform.OS === 'android') {
            Linking.openSettings();
        }
    };

    const [voicepreview, setVoicepreview] = useState(false)
    const delay = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));

    // const resetSound = async () => {
    //     if (audioPlayer) {
    //         await delay(1000)
    //         audioPlayer.stop(() => {
    //             audioPlayer?.release();
    //             audioPlayer = null;
    //         });
    //     }
    // };
    const scrollButtonBottom = useMemo(() => {
        if (keyboardvisible) {
            return keyboardHeight + composerBlockHeight + 16;
        }
        return composerBlockHeight + Math.max(insets.bottom, 8);
    }, [composerBlockHeight, keyboardvisible, keyboardHeight, insets.bottom]);

    const onStartRecord = useCallback(async () => {
        handleStop();
        dismissKeyboard();
        systemOverlayActiveRef.current = true;
        try {
            const hasPermission = await requestMicrophonePermission();
            if (!hasPermission) {
                setVoiceAct(false);
                setIsRecording(false);
                return;
            }
            setVoiceAct(true);
            setIsRecording(true);
            try {
                await audioRecorderPlayer.start();
                setVoicepreview(false);
            } catch (error) {
                setVoiceAct(false);
                setIsRecording(false);
                try {
                    await audioRecorderPlayer.stop();
                } catch (_) { /* ignore cleanup errors */ }
            }
        } finally {
            releaseSystemOverlay();
        }
    }, [releaseSystemOverlay, dismissKeyboard]);



    const onmicstop = async () => {
        audioPlayer?.current?.setCurrentTime(0)
        setPrecurrentpos(0)
        setpreDuration(0)
        setVoicepreview(true)
        const result = await audioRecorderPlayer.stop()
        audioRecorderPlayer.removeRecordBackListener();
        setRecordedFilePath(result)
    }

    //for preview section

    const [previewpause, setPreviewpause] = useState(false)
    const [preDuration, setpreDuration] = useState(0)
    const [precurrentpos, setPrecurrentpos] = useState(0)
    const presliderref = useRef(null)

    const prviewplay = async () => {


        setCurrentPositionSec(null);
        if (previewpause) {
            audioPlayer.current.stop(() => {
                setPreviewpause(false);
                clearInterval(presliderref.current);
            });
        }
        else {
            if (audioPlayer.current) {
                audioPlayer.current.release();
            }
            audioPlayer.current = new Sound(recordedFilePath, null, (error) => {
                if (error) {
                    return;
                }

                const duration = audioPlayer.current.getDuration();
                setpreDuration(duration);

                if (currentPositionSec > 0) {
                    audioPlayer.current.setCurrentTime(currentPositionSec); // Resume from last position
                }

                // Start the audio playback
                audioPlayer?.current?.play((success) => {
                    if (success) {
                        setPreviewpause(false);
                        setPrecurrentpos(0);
                        clearInterval(presliderref.current);
                    }
                });

                presliderref.current = setInterval(() => {
                    audioPlayer.current.getCurrentTime((seconds) => {
                        setPrecurrentpos(seconds); // Update current position
                    });
                }, 150);

                setPreviewpause(true)

            })
        }
    }

    const onStopRecord = async (value) => {
        setVoiceAct(false);
        setIsRecording(false);

        try {
            if (recordedFilePath) {
                if (value == "send") {
                    sendfn(recordedFilePath);
                } else {
                    setRecordedFilePath("");
                }
                setVoicepreview(false)
            }
            else {
                setIsPlaying(false)
                const result = await audioRecorderPlayer.stop();
                audioRecorderPlayer.removeRecordBackListener();
                setIsRecording(false);
                setRecordedFilePath(result);
                if (value == "send") {
                    sendfn(result);
                } else {
                    setRecordedFilePath("");
                }
            }

        } catch (error) {
            console.log("Recording error", error);
        }
    };


    const audioUrl = (data) => {
        return Platform.OS === "ios"
            ? `${ChatImageurl}${data}`
            : `${ChatImageurl}${data}`;
    };


    const handlePlayPause = (audioPath, index) => {
        const isPreview = index === 'preview'; // Add this line
        if (isPlaying && playingAudioIndex === index) {
            audioPlayer.current.stop(() => {
                setIsPlaying(false);
                setPlayingAudioIndex(null);
                setCurrentPositionSec(0);
                clearInterval(progressInterval.current);
            });
        } else {
            if (audioPlayer.current) {
                audioPlayer.current.release()
            }

            // For local preview, use empty '' for basePath
            audioPlayer.current = new Sound(audioPath, isPreview ? '' : null, (error) => {
                if (error) {
                    console.log('Sound load error:', error);
                    return;
                }

                const duration = audioPlayer.current.getDuration();
                setDurationSec(duration);

                if (currentPositionSec > 0) {
                    audioPlayer.current.setCurrentTime(currentPositionSec);
                }

                audioPlayer.current.play((success) => {
                    if (success) {
                        setIsPlaying(false);
                        setPlayingAudioIndex(null);
                        setCurrentPositionSec(0);
                        clearInterval(progressInterval.current);
                    }
                });

                progressInterval.current = setInterval(() => {
                    audioPlayer.current.getCurrentTime((seconds) => {
                        setCurrentPositionSec(seconds);
                    });
                }, 150);

                setIsPlaying(true);
                setPlayingAudioIndex(index);
                // audioPlayer.current = audioPlayer.current;
            });
        }
    };


    const checkAndShowDeletePopup = () => {
        // Check if any message has the action set to "every"
        const anyDeletedForEveryone = msgDelete.some(msg =>
            msg.messageDelete?.some(data => data.action === "every")
        );

        // Check if any chatId matches the userId
        const anyChatMatchesUserId = msgDelete.some(msg =>
            msg?.chatId?._id != user_Id
        );

        // Determine state based on the conditions
        if (anyChatMatchesUserId) {
            setMsgEvery(false); // Set to false if a chat matches the userId
        } else {
            setMsgEvery(!anyDeletedForEveryone); // Otherwise, set based on deletion status
        }
        // Show the modal
        setModalVisible(true);
    };

    function formatTimestamp(isoTimestamp) {
        const date = new Date(isoTimestamp);
        const now = new Date();

        // Check if the date is today
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = (now - date) / (1000 * 60 * 60 * 24) === 1;

        if (isToday) {
            // Format: HH:MM AM/PM
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } else if (isYesterday) {
            // Format: "Yesterday HH:MM AM/PM"
            return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
        } else {
            // Format: "DD-MM-YYYY HH:MM AM/PM"
            return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        }
    }

    const isURL = (text) => {
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlPattern.test(text);
    };

    const handleUnblockUser = async () => {
        try {

            let payload = {
                userId: user_Id,
                toUserId: detil?.members[0]?._id,
                type: "unblock",
            }

            if (apiCalled) return;
            setApiCalled(true);

            const result = await UserBlockandUnblock(payload);

            if (result?.status) {
                // setBlockedBy(false)
                showwarningmessage(t('Un-blocked_successfully'));
                navigation.goBack();
            }

            dispatch(Fetchprofile(user_Id));
            dispatch(GetSingleChats(1));

        } catch (error) {
            console.log("Error on handleUnblockUser : ", error)
        }
        finally {
            setApiCalled(false);
        }
    }

    const renderLeftAction = (progressAnimatedValue) => {
        const size = progressAnimatedValue.interpolate({
            inputRange: [0, 1, 100],
            outputRange: [0, 1, 1],
        });

        const trans = progressAnimatedValue.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, -12, -20],
        });

        const rotate = progressAnimatedValue.interpolate({
            inputRange: [0, 1, 150],
            outputRange: ["0deg", "180deg", "0deg"],
        });

        return (
            <Animated.View
                style={[
                    { width: 50 },
                    {
                        transform: [
                            { scale: size },
                            { translateX: trans },
                            // { rotateY: rotate },
                        ],
                    },
                ]}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }} >
                    <MaterialCommunityIcons
                        name={"reply"}
                        // color={theme.inversetext}
                        size={25}
                    />
                </View>
            </Animated.View>
        );
    };

    const onSwipeableOpenAction = (data, item) => {
        setReplyMessage(item)
        // setMsgEditItem(item);
        setEdit(false);
        setIsReply(true);
        setMessageId(item?._id);
        setMessage("");
        setTimeout(() => {
            setAutoFocus(true);
        }, 100);
        updateRowRef.current[item?._id]?.close();
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const handleStop = () => {
        if (audioPlayer.current) {
            audioPlayer.current.stop(() => {
                audioPlayer.current.release();
                audioPlayer.current = null;
            });
        }
    };

    const handleChatHeaderPress = useCallback(() => {
        if (pageFrom == "Event") {
            navigation.navigate("ActivityDetail", {
                detail: { eventId: detil?.eventId._id, pageFrom: "ChatGroup" },
            });
            return;
        }

        if (!isOnline || userBlocked) {
            return;
        }

        if (!detil?.isGroupchat) {
            const targetUser = otherChatMember;
            const targetUserId = targetUser?._id;
            if (targetUserId) {
                dispatch(update_FetchProfileId(targetUserId));
                navigation.navigate("HomeDetail", {
                    detail: {
                        _id: targetUserId,
                        username: targetUser?.username,
                        name: targetUser?.name,
                        profile: targetUser?.profile,
                        randomIndex: targetUser?.randomIndex,
                        MychatDiscription: targetUser?.MychatDiscription,
                        userblocked: targetUser?.userblocked,
                    },
                });
            }
            return;
        }

        navigation.navigate("GroupMembers", { detail: detil });
    }, [
        pageFrom,
        navigation,
        detil,
        isOnline,
        userBlocked,
        otherChatMember,
        dispatch,
    ]);

    const renderChatHeaderAvatar = () => (
        <View style={styles.chatHeaderAvatarFrame}>
            {detil?.isGroupchat ? (
                detil?.Image ? (
                    <View style={styles.chatHeaderAvatarImageWrap}>
                        <Image
                            style={styles.chatHeaderAvatarImage}
                            source={{
                                uri: `${Imageurl}${
                                    pageFrom == "Event"
                                        ? "/EventProfile/"
                                        : detil?.isGroupchat
                                          ? "/GroupImage/"
                                          : "/Chatimage/"
                                }${detil?.Image}`,
                            }}
                            resizeMode="cover"
                        />
                    </View>
                ) : (
                    <View style={styles.chatHeaderAvatarImageWrap}>
                        <Image
                            style={styles.chatHeaderAvatarImage}
                            source={randomimages[detil?.groupIndex]}
                            resizeMode="cover"
                        />
                    </View>
                )
            ) : displayChatProfile ? (
                <View style={styles.chatHeaderAvatarImageWrap}>
                    <Image
                        source={{ uri: `${Imageurl}${displayChatProfile}` }}
                        style={styles.chatHeaderAvatarImage}
                        resizeMode="cover"
                    />
                </View>
            ) : (
                <View style={styles.chatHeaderAvatarImageWrap}>
                    <Image
                        style={styles.chatHeaderAvatarImage}
                        source={randomimages[displayChatRandomIndex]}
                        resizeMode="cover"
                    />
                </View>
            )}
        </View>
    );

    return (
        <>

            <LinearGradient
                style={{ flex: 1 }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                colors={["#F8BE2D", "#901487"]}>
                {/* header */}
                <View style={styles.chatHeaderBar}>
                    <Pressable
                        onPress={() => {
                            if (!pageFrom == "Event" || !pageFrom == "SingleChat") {
                                navigation.navigate("Chat");
                            } else {
                                navigation.goBack();
                            }
                        }}
                        style={styles.chatHeaderBackBtn}
                    >
                        {Images.back}
                    </Pressable>


                    {selectMes ? (
                        <Pressable
                            style={{
                                width: "85%",
                                alignItems: "center",
                                flexDirection: "row",
                                height: "100%",
                                justifyContent: "flex-end",
                                padding: "4%",
                            }}>

                            <View style={{ padding: "1.5%" }}>
                                <Text style={{
                                    color: "#fff",
                                    fontFamily: Fonts.Regular,
                                    fontSize: RFValue(16),
                                }}>{msgArray?.length}</Text>
                            </View>
                            <TapGestureHandler onActivated={() => checkAndShowDeletePopup()} >
                                <View style={{ padding: devicewidth * 0.025, }}>
                                    {Images.delete}
                                </View>
                            </TapGestureHandler>
                            {/* <TapGestureHandler onActivated={() => checkCopyMessage()} >
                                    <Icon name="copy" size={deviceheight * 0.025} color={c.white} />
                                </TapGestureHandler> */}
                            {msgDelete?.length == 1 &&
                                msgDelete[0]?.chatId?._id === user_Id &&
                                msgDelete[0]?.file?.length == 0 &&
                                msgDelete[0]?.voicerecord?.length == 0 &&
                                !msgDelete[0]?.messageDelete?.some(
                                    (data) => data.action === "every"
                                ) && (
                                    <TapGestureHandler onActivated={() => {
                                        setEdit(true);
                                        messageInputRef.current.focus()
                                        setMessage(msgEdit[0]?.text);
                                        setMessageId(msgEdit[0]?._id);
                                    }} >
                                        <View
                                            style={{ padding: devicewidth * 0.025, marginLeft: "2%" }}
                                        >
                                            {Images.edit3}
                                        </View>
                                    </TapGestureHandler>
                                )}
                        </Pressable>
                    ) : (
                        <>
                            <Pressable
                                onPress={handleChatHeaderPress}
                                style={styles.chatHeaderAvatarBtn}
                            >
                                {renderChatHeaderAvatar()}
                            </Pressable>

                            <Pressable
                                onPress={handleChatHeaderPress}
                                style={styles.chatHeaderTitleOverlay}
                            >
                                <Text
                                    style={styles.chatHeaderTitle}
                                    numberOfLines={1}
                                >
                                    {displayChatName}
                                </Text>

                                {typinguser && shouldShowTypingInChat(typinguser, detil?._id, user_Id) ? (
                                    <Text style={styles.chatHeaderSubtitle}>
                                        {detil?.isGroupchat
                                            ? `${typinguser?.name} ${t('is_typing...')}`
                                            : t('typing...')}
                                    </Text>
                                ) : (
                                    !detil?.isGroupchat && !userBlocked ? (
                                        <Text style={styles.chatHeaderSubtitle}>
                                            {onlineSts ? t('online') : t('offline')}
                                        </Text>
                                    ) : (
                                        detil?.isGroupchat && pageFrom !== "Event" && (
                                            <Text style={styles.chatHeaderSubtitle}>
                                                {onlineCount > 0
                                                    ? `${onlineCount} ${t('online')} · `
                                                    : ''}
                                                {totalmembers + 1} {t('Activity_Members')}
                                            </Text>
                                        )
                                    )
                                )}
                            </Pressable>
                        </>
                    )}
                </View>

                <View style={{ flex: 1 }}>
                        {paginationloader &&
                            <View style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: devicewidth * 0.025 }} >
                                <ActivityIndicator size={'small'} color={"#fff"} />
                            </View>
                        }
                        <View style={{ flex: 1 }}>
                            <FlatList
                                style={{ flex: 1, paddingHorizontal: "4%" }}
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="none"
                                contentContainerStyle={{ paddingTop: listBottomPadding }}
                                maintainVisibleContentPosition={{
                                    minIndexForVisible: 0,
                                    autoscrollToTopThreshold: 80,
                                }}
                                extraData={`${readReceiptEpoch}:${Object.keys(readReceiptMap).length}`}
                                data={(Object.entries(groupedMessages)).reverse()}
                                ref={scrollViewRef}
                                keyExtractor={([date]) => date}
                                renderItem={({ item: [date, messages] }) => (


                                    <>
                                        <View style={{ marginBottom: "6%" }}>

                                            <View style={{
                                                width: "25%",
                                                borderRadius: borderradius * 0.5,
                                                backgroundColor: c.white,
                                                alignItems: "center", // For child elements
                                                justifyContent: "center", // For child elements
                                                borderColor: c.white,
                                                padding: "1.6%",
                                                alignSelf: "center"
                                            }}>
                                                <Text style={styles.dateHeader}>{date}</Text>
                                            </View>

                                            {messages.map((item, index) => {

                                                const msg = item?.messageData?.toLowerCase() || "";
                                                const cachedReadReceipt = getReadReceiptKeys(item).some(
                                                    (key) => readReceiptMap?.[key]
                                                );
                                                const messageReadByPeer = cachedReadReceipt || isMessageReadByPeer(
                                                    item,
                                                    otherChatMember?._id,
                                                    user_Id,
                                                    memberSourceForHeader,
                                                    !!detil?.isGroupchat
                                                );
                                                const messageRowKey = `${item?._id ?? index}-${messageReadByPeer ? 'read' : 'unread'}-${readReceiptEpoch}`;

                                                return (
                                                    !item?.messageDelete?.some(
                                                        (data) => data.action === "me" && data.id == user_Id
                                                    )
                                                    &&
                                                    (
                                                        <>
                                                            {item?.messageData ?

                                                                // <View style={{ paddingTop: "3%" }}>
                                                                //     <View style={[ styles.messageChat, ]}>
                                                                //         <Text
                                                                //             style={{ fontSize: RFValue(12), fontFamily: Fonts.Regular, color: c.black }} >
                                                                //             {item?.creator?.groupCreater?._id == user_Id ? item?.messageData : item?.creator?.groupCreater?.username + " " + t('created_the_group')}
                                                                //         </Text>
                                                                //     </View>
                                                                // </View>



                                                                <View style={{ paddingTop: "3%" }}>

                                                                    {item?.messageData === 'You have created a new group' ?

                                                                        <View style={styles.messageChat}>


                                                                            <Text
                                                                                style={{
                                                                                    fontSize: RFValue(12),
                                                                                    fontFamily: Fonts.Regular,
                                                                                    color: c.black,
                                                                                }}
                                                                            >

                                                                                {item?.creator?.groupCreater?._id === user_Id
                                                                                    ? item?.messageData
                                                                                    : `${item?.creator?.groupCreater?.username} ${t('created_the_group')}`}
                                                                            </Text>
                                                                        </View>

                                                                        :
                                                                        <View style={styles.messageChat}>
                                                                            <Text
                                                                                style={{
                                                                                    fontSize: RFValue(12),
                                                                                    fontFamily: Fonts.Regular,
                                                                                    color: c.black,
                                                                                }}
                                                                            >
                                                                                {item?.messageData}
                                                                            </Text>


                                                                        </View>
                                                                    }
                                                                </View>

                                                                :
                                                                <>

                                                                    {/* <Swipeable
                                                                            ref={(ref) => {
                                                                                updateRowRef.current[item?._id] = ref;
                                                                            }}
                                                                            friction={2}
                                                                            // enabled={item?.messageDelete?.some((data) => data.action === "every" ? false : true)}
                                                                            leftThreshold={40}
                                                                            renderLeftActions={renderLeftAction}
                                                                            onSwipeableOpen={(data) => {
                                                                                onSwipeableOpenAction(data, item);
                                                                            }}> */}

                                                                    <Swipeable
                                                                        key={messageRowKey}
                                                                        ref={(ref) => {
                                                                            updateRowRef.current[item?._id] = ref;
                                                                        }}
                                                                        friction={2}
                                                                        enabled={
                                                                            !item?.messageDelete?.some((data) => data.action === "every") // Disable if any has joined"every"
                                                                        }
                                                                        leftThreshold={40}
                                                                        renderLeftActions={renderLeftAction}
                                                                        onSwipeableOpen={(data) => onSwipeableOpenAction(data, item)}
                                                                    >

                                                                        {((item?.file?.length || item?.compressfile?.length) || (item?.voicerecord?.length) || (item?.text != "")) &&
                                                                            <>
                                                                                {shouldRenderChatItem(item) &&
                                                                                    <LongPressGestureHandler
                                                                                        minDurationMs={150} // Adjust duration for a quicker press
                                                                                        onActivated={() => handleLongPress(item)} >
                                                                                        <TapGestureHandler onActivated={() => {

                                                                                            selectMes && handleLongPress(item);
                                                                                            !selectMes &&
                                                                                                item?.file?.length > 0 &&
                                                                                                !item?.messageDelete?.some((data) => data.action === "every") &&
                                                                                                (
                                                                                                    Platform?.OS != "ios" ?
                                                                                                        handleImagePreview(
                                                                                                            item?.compressfile,
                                                                                                            `${Imageurl}`
                                                                                                        )
                                                                                                        :
                                                                                                        handleImagePreview(
                                                                                                            item?.file,
                                                                                                            `${Imageurl}`
                                                                                                        )
                                                                                                );

                                                                                        }}>
                                                                                            <View style={{ marginTop: "5%", }}>

                                                                                                {detil?.isGroupchat && item?.chatId?._id != user_Id &&
                                                                                                    <View
                                                                                                        style={item?.chatId?._id === user_Id
                                                                                                            ? styles.senderImg
                                                                                                            : styles.receiverImg}>

                                                                                                        {item?.chatId?.profile ?
                                                                                                            <Image
                                                                                                                source={{
                                                                                                                    uri: `${Imageurl}${item?.chatId?.profile}`,
                                                                                                                }}
                                                                                                                style={styles.profileImage} />
                                                                                                            :
                                                                                                            <Image
                                                                                                                style={styles.profileImage}
                                                                                                                source={randomimages[item?.chatId?.randomIndex]}
                                                                                                                resizeMode="cover" />
                                                                                                        }
                                                                                                        {item?.chatId?._id != user_Id &&
                                                                                                            <Text
                                                                                                                style={[
                                                                                                                    {
                                                                                                                        color: item?.chatId?._id === user_Id ? "yellow" : "white",
                                                                                                                        fontFamily: Fonts.Regular,
                                                                                                                        fontSize: RFValue(12),
                                                                                                                    },
                                                                                                                ]}
                                                                                                            >
                                                                                                                {item?.chatId?.username}
                                                                                                            </Text>}
                                                                                                    </View>}


                                                                                                <View style={!item.isfocusdelete
                                                                                                    ? highlighted
                                                                                                    : styles.highlightedButton}>
                                                                                                    <View style={item?.chatId?._id === user_Id ? styles.senderui : styles.receiverui}>

                                                                                                        <View style={{}}>

                                                                                                            <View>
                                                                                                                {(item?.replyMessage?.file) &&
                                                                                                                    <View
                                                                                                                        style={{
                                                                                                                            backgroundColor: "#444",
                                                                                                                            borderRadius: 3,
                                                                                                                            width: "100%",
                                                                                                                            padding: 6,
                                                                                                                        }} >

                                                                                                                        <Text
                                                                                                                            style={{
                                                                                                                                color: c.white,
                                                                                                                                fontFamily: Fonts.Regular,
                                                                                                                                fontSize: RFValue(11),
                                                                                                                            }} >
                                                                                                                            {User_Id == item?.replyMessage?.chatId?._id ? "You" : item?.replyMessage?.chatId?.username}
                                                                                                                        </Text>

                                                                                                                        <View style={{ flexDirection: "column" }}>
                                                                                                                            {item?.replyMessage?.file?.length ?

                                                                                                                                <View style={{ flexDirection: "row", minWidth: "30%", minHeight: 40, justifyContent: "space-between", alignItems: "center" }}>
                                                                                                                                    <Text
                                                                                                                                        style={{
                                                                                                                                            color: c.white,
                                                                                                                                            fontFamily: Fonts.Regular,
                                                                                                                                            fontSize: RFValue(11),

                                                                                                                                        }} >
                                                                                                                                        {item?.replyMessage?.text ? item?.replyMessage?.text : item?.replyMessage?.voicerecord?.length ? "Voice message" : item?.replyMessage?.file?.length ? "Image" : ""}
                                                                                                                                    </Text>

                                                                                                                                    <Image
                                                                                                                                        style={{
                                                                                                                                            height: 35,
                                                                                                                                            width: 35,
                                                                                                                                            padding: 2,
                                                                                                                                            borderRadius: 10
                                                                                                                                        }}
                                                                                                                                        resizeMode="cover"
                                                                                                                                        source={{
                                                                                                                                            uri: `${Imageurl}${item?.replyMessage?.file[0]}`,
                                                                                                                                        }} />
                                                                                                                                </View>
                                                                                                                                :

                                                                                                                                <View style={{ flexDirection: "row", alignItems: "center", padding: 2 }}>
                                                                                                                                    {item?.replyMessage?.voicerecord?.length ?
                                                                                                                                        <View style={{ padding: 1 }}>{Images.mic}</View>
                                                                                                                                        : ""}

                                                                                                                                    <Text
                                                                                                                                        style={{
                                                                                                                                            color: c.white,
                                                                                                                                            fontFamily: Fonts.Regular,
                                                                                                                                            fontSize: RFValue(11),
                                                                                                                                        }}
                                                                                                                                    >
                                                                                                                                        {item?.replyMessage?.text ? item?.replyMessage?.text : item?.replyMessage?.voicerecord?.length ? "Voice message" : item?.replyMessage?.file?.length ? "Image" : ""}
                                                                                                                                    </Text>
                                                                                                                                </View>

                                                                                                                            }
                                                                                                                        </View>
                                                                                                                    </View>
                                                                                                                }
                                                                                                            </View>

                                                                                                            {(item?.uploadFile?.status || item?.uploadAudioFile?.status || item?.uploadText?.status) ?
                                                                                                                <>
                                                                                                                    <View>
                                                                                                                        {item?.uploadFile?.status &&
                                                                                                                            <>
                                                                                                                                <View
                                                                                                                                    style={{
                                                                                                                                        width: devicewidth * 0.6,
                                                                                                                                        height: item?.file?.length == 2
                                                                                                                                            ? deviceheight * 0.15
                                                                                                                                            : deviceheight * 0.35,
                                                                                                                                        padding: "2%",
                                                                                                                                        flexWrap: "wrap",
                                                                                                                                        flexDirection: "row",
                                                                                                                                        paddingBottom: item?.file?.length == 2 ? "6%" : null,
                                                                                                                                    }}
                                                                                                                                >
                                                                                                                                    {item?.file?.length == 1 ? (
                                                                                                                                        <View
                                                                                                                                            style={{
                                                                                                                                                width: "100%",
                                                                                                                                                height: "100%",
                                                                                                                                            }}
                                                                                                                                        >
                                                                                                                                            <Image
                                                                                                                                                style={{
                                                                                                                                                    width: "100%",
                                                                                                                                                    height: "100%",
                                                                                                                                                    resizeMode: "cover",
                                                                                                                                                    borderRadius: borderradius * 0.5,
                                                                                                                                                }}
                                                                                                                                                blurRadius={Platform.OS === 'ios' ? 30 : 8}
                                                                                                                                                source={{
                                                                                                                                                    uri: item?.file[0]?.uri,
                                                                                                                                                }} />
                                                                                                                                        </View>
                                                                                                                                    )
                                                                                                                                        :
                                                                                                                                        (
                                                                                                                                            item?.file?.map((e) => (
                                                                                                                                                <View
                                                                                                                                                    key={e?.uri}
                                                                                                                                                    style={{
                                                                                                                                                        alignItems: "center",
                                                                                                                                                        width: "45%",
                                                                                                                                                        height: item?.file?.length == 2
                                                                                                                                                            ? "100%"
                                                                                                                                                            : "45%",
                                                                                                                                                        marginLeft: "5%",
                                                                                                                                                        marginTop: "5%",
                                                                                                                                                    }}>

                                                                                                                                                    <Image
                                                                                                                                                        style={{
                                                                                                                                                            width: "100%",
                                                                                                                                                            height: "100%",
                                                                                                                                                            resizeMode: "cover",
                                                                                                                                                            borderRadius: 10,
                                                                                                                                                        }}
                                                                                                                                                        blurRadius={Platform.OS === 'ios' ? 30 : 8}
                                                                                                                                                        source={{ uri: e?.uri, }}
                                                                                                                                                    />
                                                                                                                                                </View>
                                                                                                                                            ))
                                                                                                                                        )}

                                                                                                                                </View>

                                                                                                                            </>}
                                                                                                                    </View>

                                                                                                                    <View>
                                                                                                                        {item?.uploadAudioFile?.status &&
                                                                                                                            <>
                                                                                                                                <View>
                                                                                                                                    <View
                                                                                                                                        style={{
                                                                                                                                            width: devicewidth * 0.8,
                                                                                                                                            height: deviceheight * 0.065,
                                                                                                                                            alignItems: "center",
                                                                                                                                            paddingHorizontal: "2.5%",
                                                                                                                                            flexDirection: "row",
                                                                                                                                        }}>

                                                                                                                                        <View
                                                                                                                                            style={{
                                                                                                                                                paddingHorizontal: 8,
                                                                                                                                                paddingVertical: 8,
                                                                                                                                                justifyContent: "center",
                                                                                                                                                backgroundColor: "#fff",
                                                                                                                                                borderRadius: 30,
                                                                                                                                                alignItems: "center",
                                                                                                                                                marginRight: 2
                                                                                                                                            }}>
                                                                                                                                            {Images.uploadw}
                                                                                                                                        </View>
                                                                                                                                        <View
                                                                                                                                            style={{
                                                                                                                                                width: "85%",
                                                                                                                                                height: "100%",
                                                                                                                                                justifyContent: "center",
                                                                                                                                                alignItems: "center",
                                                                                                                                            }}>

                                                                                                                                            <Slider
                                                                                                                                                style={{ width: "100%" }}
                                                                                                                                                minimumTrackTintColor="#1fb28a"
                                                                                                                                                maximumTrackTintColor="#d3d3d3"
                                                                                                                                                thumbTintColor="#b9e4c9" />
                                                                                                                                        </View>
                                                                                                                                    </View>
                                                                                                                                </View>
                                                                                                                            </>}
                                                                                                                    </View>

                                                                                                                    <View>
                                                                                                                        {item?.uploadText?.status &&
                                                                                                                            <>
                                                                                                                                <View>
                                                                                                                                    <Text style={{
                                                                                                                                        color: "#fff",
                                                                                                                                        fontFamily: Fonts.Regular,
                                                                                                                                        fontSize: RFValue(12),
                                                                                                                                        paddingRight: "4%",
                                                                                                                                        paddingHorizontal: "4%",
                                                                                                                                        paddingBottom: "1.5%",
                                                                                                                                        paddingTop: "1.5%"

                                                                                                                                    }}>
                                                                                                                                        {item?.text}
                                                                                                                                    </Text>
                                                                                                                                </View>

                                                                                                                            </>}
                                                                                                                    </View>
                                                                                                                </>

                                                                                                                :

                                                                                                                <>


                                                                                                                    {item?.file?.length || item?.compressfile?.length ?
                                                                                                                        (
                                                                                                                            <View>
                                                                                                                                {!item?.messageDelete?.some(
                                                                                                                                    (data) => data.action === "every"
                                                                                                                                ) ? (

                                                                                                                                    <View>

                                                                                                                                        <View
                                                                                                                                            style={{
                                                                                                                                                width: devicewidth * 0.6,
                                                                                                                                                height: item?.file?.length == 2
                                                                                                                                                    ? deviceheight * 0.15
                                                                                                                                                    : deviceheight * 0.35,
                                                                                                                                                padding: "2.5%",
                                                                                                                                                paddingBottom: item?.file?.length == 2 ? "6%" : null,
                                                                                                                                                flexWrap: "wrap",
                                                                                                                                                flexDirection: "row",
                                                                                                                                                // backgroundColor: "red"
                                                                                                                                            }}
                                                                                                                                        >


                                                                                                                                            {Platform?.OS != "ios" ? (
                                                                                                                                                <>
                                                                                                                                                    {item?.compressfile?.length == 1 ? (
                                                                                                                                                        <View
                                                                                                                                                            style={{
                                                                                                                                                                width: "100%",
                                                                                                                                                                height: "100%",
                                                                                                                                                            }}
                                                                                                                                                        >
                                                                                                                                                            <Image
                                                                                                                                                                style={{
                                                                                                                                                                    width: "100%",
                                                                                                                                                                    height: "100%",
                                                                                                                                                                    resizeMode: "cover",
                                                                                                                                                                    borderRadius: borderradius * 0.5,

                                                                                                                                                                }}
                                                                                                                                                                source={{
                                                                                                                                                                    uri: `${Imageurl}${item?.compressfile[0]}`,
                                                                                                                                                                }} />

                                                                                                                                                        </View>
                                                                                                                                                    ) : (
                                                                                                                                                        item?.compressfile?.map((e) => (
                                                                                                                                                            <View
                                                                                                                                                                key={e}
                                                                                                                                                                style={{
                                                                                                                                                                    alignItems: "center",
                                                                                                                                                                    width: "45%",
                                                                                                                                                                    height: item?.file?.length == 2
                                                                                                                                                                        ? "100%"
                                                                                                                                                                        : "45%",
                                                                                                                                                                    marginLeft: "5%",
                                                                                                                                                                    marginTop: "5%",
                                                                                                                                                                }}>

                                                                                                                                                                <Image
                                                                                                                                                                    style={{
                                                                                                                                                                        width: "100%",
                                                                                                                                                                        height: "100%",
                                                                                                                                                                        resizeMode: "cover",
                                                                                                                                                                        borderRadius: 10,
                                                                                                                                                                    }}
                                                                                                                                                                    source={{
                                                                                                                                                                        uri: `${Imageurl}${e}`,
                                                                                                                                                                    }} />
                                                                                                                                                            </View>
                                                                                                                                                        ))
                                                                                                                                                    )}
                                                                                                                                                </>
                                                                                                                                            ) : (
                                                                                                                                                <>

                                                                                                                                                    {item?.file?.length == 1 ? (
                                                                                                                                                        <View
                                                                                                                                                            style={{
                                                                                                                                                                width: "100%",
                                                                                                                                                                height: "100%",
                                                                                                                                                            }}
                                                                                                                                                        >
                                                                                                                                                            <Image
                                                                                                                                                                style={{
                                                                                                                                                                    width: "100%",
                                                                                                                                                                    height: "100%",
                                                                                                                                                                    resizeMode: "cover",
                                                                                                                                                                    borderRadius: borderradius * 0.5,
                                                                                                                                                                }}
                                                                                                                                                                source={{
                                                                                                                                                                    uri: `${Imageurl}${item?.file[0]}`,
                                                                                                                                                                }} />
                                                                                                                                                        </View>
                                                                                                                                                    ) : (
                                                                                                                                                        item?.file?.map((e) => (
                                                                                                                                                            <View
                                                                                                                                                                key={e}
                                                                                                                                                                style={{
                                                                                                                                                                    alignItems: "center",
                                                                                                                                                                    width: "45%",
                                                                                                                                                                    height: item?.file?.length == 2
                                                                                                                                                                        ? "100%"
                                                                                                                                                                        : "45%",
                                                                                                                                                                    marginLeft: "5%",
                                                                                                                                                                    marginTop: "5%",
                                                                                                                                                                }}>
                                                                                                                                                                <Image
                                                                                                                                                                    style={{
                                                                                                                                                                        width: "100%",
                                                                                                                                                                        height: "100%",
                                                                                                                                                                        resizeMode: "cover",
                                                                                                                                                                        borderRadius: 10,
                                                                                                                                                                    }}
                                                                                                                                                                    source={{
                                                                                                                                                                        uri: `${Imageurl}${e}`,
                                                                                                                                                                    }} />
                                                                                                                                                            </View>
                                                                                                                                                        ))
                                                                                                                                                    )}
                                                                                                                                                </>
                                                                                                                                            )}

                                                                                                                                        </View>
                                                                                                                                    </View>
                                                                                                                                ) : (
                                                                                                                                    <View>
                                                                                                                                        <Text
                                                                                                                                            style={{
                                                                                                                                                color: item?.chatId?._id === user_Id
                                                                                                                                                    ? "#fff"
                                                                                                                                                    : "#000",
                                                                                                                                                fontFamily: Fonts.Regular,
                                                                                                                                                fontSize: RFValue(12),
                                                                                                                                                paddingRight: "4%",
                                                                                                                                                paddingHorizontal: "4%",
                                                                                                                                                paddingBottom: "1.5%",
                                                                                                                                                paddingTop: "1.5%"

                                                                                                                                            }}>
                                                                                                                                            {t('This_message_was_deleted')}
                                                                                                                                        </Text>
                                                                                                                                    </View>
                                                                                                                                )}
                                                                                                                            </View>
                                                                                                                        )

                                                                                                                        :

                                                                                                                        item?.voicerecord?.length ?
                                                                                                                            (
                                                                                                                                <>
                                                                                                                                    {!item?.messageDelete?.some(
                                                                                                                                        (data) => data.action === "every"
                                                                                                                                    ) ? (
                                                                                                                                        <View>
                                                                                                                                            <View style={{
                                                                                                                                                width: devicewidth * 0.8,
                                                                                                                                                height: deviceheight * 0.065,
                                                                                                                                                alignItems: 'center',
                                                                                                                                                paddingHorizontal: "2.5%",
                                                                                                                                                flexDirection: "row",
                                                                                                                                                marginTop: 2
                                                                                                                                            }}>

                                                                                                                                                <TapGestureHandler onActivated={() => {
                                                                                                                                                    handlePlayPause(audioUrl(item?.voicerecord[0]), index);
                                                                                                                                                }}>
                                                                                                                                                    <View style={{ paddingHorizontal: 8, paddingVertical: 8, alignSelf: "center", justifyContent: "center", backgroundColor: c.voliet, borderRadius: 30, alignItems: "center", marginRight: 3 }}>
                                                                                                                                                        <Playicon
                                                                                                                                                            size={devicewidth * 0.065}
                                                                                                                                                            color={item?.chatId?._id === user_Id ? "#fff" : c?.primary}
                                                                                                                                                            name={isPlaying && playingAudioIndex == index ? "pause" : "play"} />
                                                                                                                                                    </View>
                                                                                                                                                </TapGestureHandler>

                                                                                                                                                {/* Slider for current position */}
                                                                                                                                                {playingAudioIndex == index ?
                                                                                                                                                    <View style={{ width: "85%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                                                                                                                                                        {isPlaying && playingAudioIndex == index ? (
                                                                                                                                                            <Slider
                                                                                                                                                                style={{ width: '100%' }}
                                                                                                                                                                minimumValue={0}
                                                                                                                                                                maximumValue={durationSec}
                                                                                                                                                                value={currentPositionSec}
                                                                                                                                                                onSlidingComplete={(value) => audioPlayer?.current?.setCurrentTime(value)} // Seeking to a specific time
                                                                                                                                                                minimumTrackTintColor="#1fb28a"
                                                                                                                                                                maximumTrackTintColor="#d3d3d3"
                                                                                                                                                                thumbTintColor="#b9e4c9" />
                                                                                                                                                        )
                                                                                                                                                            : (
                                                                                                                                                                <Slider
                                                                                                                                                                    style={{ width: '100%' }}
                                                                                                                                                                    minimumValue={0}
                                                                                                                                                                    maximumValue={durationSec}
                                                                                                                                                                    value={currentPositionSec}
                                                                                                                                                                    minimumTrackTintColor="#1fb28a"
                                                                                                                                                                    maximumTrackTintColor="#d3d3d3"
                                                                                                                                                                    thumbTintColor="#b9e4c9" />
                                                                                                                                                            )}

                                                                                                                                                    </View>
                                                                                                                                                    :
                                                                                                                                                    <View style={{ width: "85%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                                                                                                                                                        <Slider
                                                                                                                                                            style={{ width: '100%' }}
                                                                                                                                                            minimumTrackTintColor="#1fb28a"
                                                                                                                                                            maximumTrackTintColor="#d3d3d3"
                                                                                                                                                            thumbTintColor="#b9e4c9" />
                                                                                                                                                    </View>}
                                                                                                                                            </View>
                                                                                                                                        </View>

                                                                                                                                    ) : (
                                                                                                                                        <View>
                                                                                                                                            <Text
                                                                                                                                                style={{
                                                                                                                                                    color: item?.chatId?._id === user_Id
                                                                                                                                                        ? "#fff"
                                                                                                                                                        : "#000",
                                                                                                                                                    fontFamily: Fonts.Regular,
                                                                                                                                                    fontSize: RFValue(12),
                                                                                                                                                    paddingRight: "4%",
                                                                                                                                                    paddingHorizontal: "4%",
                                                                                                                                                    paddingBottom: "1.5%",
                                                                                                                                                    paddingTop: "1.5%"
                                                                                                                                                }}>
                                                                                                                                                {t('This_message_was_deleted')}
                                                                                                                                            </Text>
                                                                                                                                        </View>
                                                                                                                                    )}
                                                                                                                                </>
                                                                                                                            )

                                                                                                                            :

                                                                                                                            (
                                                                                                                                <>

                                                                                                                                    <TouchableOpacity onPress={() => Linking.openURL(item?.text)}>

                                                                                                                                        <View>
                                                                                                                                            <Text
                                                                                                                                                style={{
                                                                                                                                                    color: isURL(item?.text) ? "#03adfc" : item?.chatId?._id === user_Id ? "#fff" : "#000",
                                                                                                                                                    fontFamily: Fonts.Regular,
                                                                                                                                                    fontSize: RFValue(12),
                                                                                                                                                    paddingRight: "4%",
                                                                                                                                                    paddingHorizontal: "4%",
                                                                                                                                                    paddingBottom: "1.5%",
                                                                                                                                                    paddingTop: "1.5%"
                                                                                                                                                }}
                                                                                                                                            >
                                                                                                                                                {item?.messageDelete?.some(
                                                                                                                                                    (data) => data.action === "every"
                                                                                                                                                )
                                                                                                                                                    ? t('This_message_was_deleted')
                                                                                                                                                    : !item?.messageDelete?.some(
                                                                                                                                                        (data) => data.action === "me" && data.id == user_Id
                                                                                                                                                    ) && <>{item?.text}</>}
                                                                                                                                            </Text>
                                                                                                                                        </View>
                                                                                                                                    </TouchableOpacity>
                                                                                                                                </>
                                                                                                                            )}

                                                                                                                </>}
                                                                                                        </View>

                                                                                                        <View style={{ position: "absolute", bottom: "-1.5%", right: 4, }} >
                                                                                                            {item?.chatId?._id === user_Id && (
                                                                                                                <>

                                                                                                                    <>
                                                                                                                        {item?.msgType == "local" ?

                                                                                                                            <>
                                                                                                                                <Clockicon name={"clockcircleo"} size={devicewidth * 0.0275} color={"#fff"} style={{ alignSelf: "center", bottom: "20%" }} />
                                                                                                                            </>
                                                                                                                            :
                                                                                                                            <>

                                                                                                                                {userBlocked
                                                                                                                                    ? Images.doubletick
                                                                                                                                    : messageReadByPeer
                                                                                                                                        ? Images.doubletickblue
                                                                                                                                        : Images.doubletick}
                                                                                                                            </>

                                                                                                                        }
                                                                                                                    </>


                                                                                                                </>
                                                                                                            )}
                                                                                                        </View>

                                                                                                    </View>
                                                                                                </View>

                                                                                            </View>
                                                                                        </TapGestureHandler>
                                                                                    </LongPressGestureHandler>}
                                                                            </>}
                                                                    </Swipeable>
                                                                </>
                                                            }

                                                            {(!item?.messageData) && shouldRenderChatItem(item) &&

                                                                <>
                                                                    {((item?.file?.length || item?.compressfile?.length) || (item?.voicerecord?.length) || (item?.text != "")) &&
                                                                        <Text
                                                                            style={{
                                                                                color: "#fff",
                                                                                fontFamily: Fonts.Light,
                                                                                fontSize: RFValue(10),
                                                                                marginTop: "1%",
                                                                                textAlign: item?.chatId?._id === user_Id ? "right" : "left",
                                                                            }}>
                                                                            {item?.edited_status && "Edited "}
                                                                            {formatAMPM(new Date(item?.createdAt))}
                                                                        </Text>}
                                                                </>}
                                                        </>
                                                    ));
                                            })
                                            }
                                        </View>
                                    </>
                                )}
                                onEndReached={!isLoading && !maxreached && handleScroll}
                                onScroll={capturescroll}
                                showsVerticalScrollIndicator={false}
                                onEndReachedThreshold={0.05}
                                onContentSizeChange={() => {
                                    if (!showScrollButton) {
                                        scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
                                    }
                                }
                                }

                                inverted
                            />

                            <KeyboardStickyView
                                offset={{ closed: 0, opened: 12 }}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }}
                            >
                            <View style={{
                                paddingHorizontal: "4%",
                                paddingBottom: keyboardvisible ? 10 : Math.max(insets.bottom, 6),
                            }}>
                            <>
                                {isRecording ? (

                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "#A23178",
                                        borderRadius: 12,
                                        margin: 8,
                                        elevation: 1,
                                        paddingHorizontal: 12,
                                        minHeight: 60,
                                        flexDirection: "column" // fixed height instead of deviceheight * 0.1
                                    }}>
                                        {(replyMessage?.text || replyMessage?.voicerecord?.length || replyMessage?.file?.length) && (
                                            <View
                                                style={{
                                                    //backgroundColor: "#444",
                                                    borderRadius: 8,
                                                    margin: 3,
                                                    padding: 6,
                                                    marginBottom: 6,
                                                    width: "100%"
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: c.white,
                                                            fontFamily: Fonts.Regular,
                                                            fontSize: RFValue(11),
                                                        }}
                                                    >
                                                        {User_Id == replyMessage?.chatId?._id ? "You" : replyMessage?.chatId?.username}
                                                    </Text>
                                                    <Text
                                                        onPress={() => setReplyMessage({})}
                                                        style={{
                                                            color: c.white,
                                                            fontFamily: Fonts.Regular,
                                                            fontSize: RFValue(14),
                                                            width: "15%",
                                                            textAlign: "right",
                                                            paddingRight: 3,
                                                            textAlignVertical: "center",
                                                        }}
                                                    >
                                                        X
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={{
                                                        color: c.white,
                                                        fontFamily: Fonts.Regular,
                                                        fontSize: RFValue(11),
                                                    }}
                                                >
                                                    {replyMessage?.text ? replyMessage?.text : replyMessage?.voicerecord?.length ? "Voice message" : replyMessage?.file?.length ? "Image" : ""}
                                                </Text>
                                            </View>
                                        )}

                                        <>
                                            <View style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                margin: 8,
                                                paddingHorizontal: 10,
                                                justifyContent: "space-between"
                                            }}>

                                                {voicepreview ?
                                                    <>
                                                        <View style={{
                                                            width: devicewidth * 0.7,
                                                            height: deviceheight * 0.065,
                                                            alignItems: 'center',
                                                            // paddingHorizontal: "2.5%",
                                                            flexDirection: "row",
                                                            marginTop: 2
                                                        }}>
                                                            <Pressable onPress={() => prviewplay()}>
                                                                <View style={{ paddingHorizontal: 8, paddingVertical: 8, alignSelf: "center", justifyContent: "center", backgroundColor: c.voliet, borderRadius: 30, alignItems: "center", marginRight: 3 }}>
                                                                    <Playicon
                                                                        size={devicewidth * 0.065}
                                                                        color={c?.primary}
                                                                        name={previewpause ? "pause" : "play"} />
                                                                </View>
                                                            </Pressable>
                                                            <Slider
                                                                style={{ width: '100%' }}
                                                                minimumValue={0}
                                                                maximumValue={preDuration}
                                                                value={precurrentpos}
                                                                onSlidingComplete={(value) => {
                                                                    audioPlayer?.current?.setCurrentTime(value)
                                                                }}
                                                                minimumTrackTintColor="#1fb28a"
                                                                maximumTrackTintColor="#d3d3d3"
                                                                thumbTintColor="#b9e4c9" />
                                                        </View>
                                                    </>


                                                    :

                                                    <LottieView
                                                        style={{ width: "100%", height: 45 }}
                                                        source={Lotties.micani}
                                                        autoPlay
                                                        loop
                                                        resizeMode="cover"
                                                    />}



                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    margin: 8,
                                                }} >

                                                {/* ❌ Delete Button */}
                                                <Pressable
                                                    onPress={() => onStopRecord("delete")}
                                                    style={{
                                                        width: 45,
                                                        height: 45,
                                                        borderRadius: 25,
                                                        backgroundColor: "#000",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Deleteicon
                                                        width={devicewidth * 0.065}
                                                        height={devicewidth * 0.065}
                                                        style={{ alignSelf: "center" }}
                                                    />
                                                </Pressable>

                                                {/* 🎤 Lottie Mic Animation */}
                                                <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16 }}>

                                                    {!voicepreview &&
                                                        <TapGestureHandler onActivated={() => {
                                                            onmicstop()
                                                            // handlePlayPause(recordedFilePath, 'preview');
                                                        }}>
                                                            <View style={{ paddingHorizontal: 8, paddingVertical: 8, alignSelf: "center", justifyContent: "center", backgroundColor: c.voliet, borderRadius: 30, alignItems: "center", marginRight: 3 }}>
                                                                <Playicon
                                                                    size={devicewidth * 0.065}
                                                                    color={c?.primary}
                                                                    name={"pause"} />
                                                            </View>
                                                        </TapGestureHandler>}
                                                </View>

                                                {/* 📤 Send Button */}
                                                <Pressable
                                                    onPress={() => onStopRecord("send")}
                                                    style={{
                                                        width: 45,
                                                        height: 45,
                                                        borderRadius: 25,
                                                        backgroundColor: "#000",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {Images.send}
                                                </Pressable>

                                            </View>
                                        </>


                                    </View>

                                ) : (

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "flex-end",
                                        }} >

                                        {/* Input Container */}

                                        <View
                                            style={{
                                                flex: 1,
                                                backgroundColor: "#A23178",
                                                borderRadius: 12,
                                                marginVertical: 6,
                                                marginRight: 4,
                                                elevation: 1,
                                                paddingHorizontal: 10,
                                                paddingVertical: 6,
                                                minHeight: 48,
                                                maxHeight: 120,
                                                justifyContent: "center",
                                            }}>
                                            {/* Reply Preview */}
                                            {(replyMessage?.text || replyMessage?.voicerecord?.length || replyMessage?.file?.length) && (
                                                <View
                                                    style={{
                                                        //backgroundColor: "#444",
                                                        borderRadius: 8,
                                                        margin: 3,
                                                        padding: 6,
                                                        marginBottom: 6,
                                                        width: "100%"
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection: "row",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: c.white,
                                                                fontFamily: Fonts.Regular,
                                                                fontSize: RFValue(11),
                                                            }}
                                                        >
                                                            {User_Id == replyMessage?.chatId?._id ? "You" : replyMessage?.chatId?.username}
                                                        </Text>
                                                        <Text
                                                            onPress={() => setReplyMessage({})}
                                                            style={{
                                                                color: c.white,
                                                                fontFamily: Fonts.Regular,
                                                                fontSize: RFValue(14),
                                                                width: "15%",
                                                                textAlign: "right",
                                                                paddingRight: 3,
                                                                textAlignVertical: "center",
                                                            }}
                                                        >
                                                            X
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            color: c.white,
                                                            fontFamily: Fonts.Regular,
                                                            fontSize: RFValue(11),
                                                        }}
                                                    >
                                                        {replyMessage?.text ? replyMessage?.text : replyMessage?.voicerecord?.length ? "Voice message" : replyMessage?.file?.length ? "Image" : ""}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* TextInput + Media Buttons */}
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <TextInput
                                                    placeholder={t("Write_a_message")}
                                                    ref={messageInputRef}
                                                    placeholderTextColor={"#bbb"}
                                                    style={{
                                                        flex: 1,
                                                        color: "#fff",
                                                        fontFamily: Fonts.Regular,
                                                        fontSize: RFValue(15),
                                                        paddingVertical: 4,
                                                        maxHeight: 88,
                                                    }}
                                                    multiline
                                                    scrollEnabled
                                                    value={message}
                                                    onChangeText={(text) => handleTexttype(text)}
                                                />

                                                {!message?.length && (
                                                    <View style={{ flexDirection: "row", marginLeft: 6 }}>
                                                        <Pressable
                                                            onPress={() => Mediafn("library")}
                                                            hitSlop={8}
                                                            style={{ padding: 6 }}
                                                        >
                                                            {Images.gallery}
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => Mediafn("camera")}
                                                            hitSlop={8}
                                                            style={{ padding: 6 }}
                                                        >
                                                            {Images.camera}
                                                        </Pressable>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {/* Send / Mic Button */}
                                        <View
                                            style={{
                                                width: 45,
                                                height: 45,
                                                marginLeft: 4,
                                                marginBottom: 6,
                                                backgroundColor: c.intermediate,
                                                borderRadius: 30,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {message?.length ? (
                                                <TapGestureHandler
                                                    onActivated={() => {
                                                        edit ? onMessageEdit() : sendfn();
                                                    }}
                                                >
                                                    <View>{Images.send}</View>
                                                </TapGestureHandler>
                                            ) : (
                                                <Pressable onPress={onStartRecord} hitSlop={8}>
                                                    {Images.mic}
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>

                                )}
                            </>
                            </View>
                            </KeyboardStickyView>
                        </View>

                        {showMessageLoader && (
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                <ActivityIndicator color={"#fff"} size={"small"} />
                            </View>
                        )}

                        {blockedBy &&
                            <View style={styles.blockedContainer}>
                                <Text style={{ textAlign: "center", fontSize: RFValue(14), fontFamily: Fonts.Medium, color: c.primary }}> {t("YouBlockedUser_UnblockMessage")}</Text>
                                <Pressable
                                    style={styles.Unlockbtn}
                                    onPress={() => handleUnblockUser()}>
                                    <Text style={{ color: c.white, fontFamily: Fonts.Medium, fontSize: RFValue(14), verticalAlign: "center", }}>{t('Unblock')}</Text>
                                </Pressable>
                            </View>
                        }
                </View>

            </LinearGradient>

            {/* model stufss */}
            {showScrollButton && !isRecording && !voiceAct &&
                <Pressable onPress={() => scrollToEnd()} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, borderRadius: borderradius * 3, backgroundColor: '#e4dfdf', position: "absolute", right: "5%", bottom: scrollButtonBottom, alignItems: "center", justifyContent: "center", zIndex: 2 }} >
                    <Swipedown name={"angle-double-down"} color={"#000"} size={devicewidth * 0.07} />
                </Pressable>}
            {imagePrevUrl?.length > 0 &&
                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    onRequestClose={() => {
                        setIsModalVisible(false);
                        setImagePrevUrl([]);
                    }}
                >
                    {imagePrevUrl?.length > 1 ?
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            style={{ width: "100%", height: "100%" }}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setIsModalVisible(false);
                                setImagePrevUrl([]);
                            }}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}
                            onChange={(index) => {
                                if (index !== undefined && index !== null) {
                                    setCurrentIndex(index);
                                }
                            }}
                        />
                        :
                        <ImageViewer
                            imageUrls={imagePrevUrl}
                            style={{ width: "100%", height: "100%" }}
                            enableSwipeDown={true}
                            onSwipeDown={() => {
                                setIsModalVisible(false);
                                setImagePrevUrl([]);
                            }}
                            renderIndicator={() => null}
                            saveToLocalByLongPress={false}
                            onLongPress={() => { }}

                        />
                    }

                    <View style={{ width: "100%", height: 100, backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 18, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity style={styles.backButton} onPress={() => {
                            setImagePrevUrl([])
                            setIsModalVisible(false)
                        }}>
                            {Images.back}
                        </TouchableOpacity>


                        <TouchableOpacity style={[styles.backButton, { marginRight: "5%" }]} onPress={() => {
                            const url = imagePrevUrl[currentIndex]["url"]
                            downloadImage(url)
                        }}>
                            <Dowloadicon
                                name="download"
                                size={devicewidth * 0.05}
                            />
                        </TouchableOpacity>

                    </View>



                </Modal>
            }

            <DeletePopup
                modalVisible={modalVisible}
                msgEvery={msgEvery}
                deleteMeFn={onMessageDeleteforMe}
                deleteEvrFn={onMessageDeleteforEveryone}
                setModalVisible={(e) => setModalVisible(e)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    senderui: {
        maxWidth: "90%",
        alignSelf: "flex-end",
        backgroundColor: c.secondary, // WhatsApp light green
        paddingVertical: 8,
        paddingHorizontal: 3,
        marginVertical: 4,
        borderTopLeftRadius: borderradius * 0.5,
        borderTopRightRadius: borderradius * 0.5,
        borderBottomLeftRadius: borderradius * 0.5,
        borderBottomRightRadius: 0, // small corner
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        elevation: 2,
    },
    receiverui: {
        maxWidth: "90%",
        alignSelf: "flex-start",
        backgroundColor: "#ECECEC", // light grey
        paddingVertical: 4,
        paddingHorizontal: 3,
        borderTopLeftRadius: 0, // little sharp corner
        borderTopRightRadius: borderradius * 0.5,
        borderBottomLeftRadius: borderradius * 0.5,
        borderBottomRightRadius: borderradius * 0.5,
        marginVertical: 4,
    },
    senderImg: {
        maxWidth: "90%",
        width: "auto",
        borderTopLeftRadius: borderradius * 0.5,
        borderBottomLeftRadius: borderradius * 0.5,
        borderBottomRightRadius: borderradius * 0.5,
        alignSelf: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    receiverImg: {
        maxWidth: "90%",
        width: "auto",
        borderTopRightRadius: borderradius * 0.5,
        borderBottomLeftRadius: borderradius * 0.5,
        borderBottomRightRadius: borderradius * 0.5,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: 5,
    },
    header: {
        backgroundColor: "#f1f1f1",
        width: "25%",
        padding: "2.0%",
        borderRadius: borderradius * 0.3,
        alignSelf: "center",
    },
    headerText: {
        fontSize: RFValue(10),
        fontFamily: Fonts.Bold,
        color: c.secondary,
        textAlign: "center",
    },
    highlightedButton: {
        width: "auto",
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        borderRadius: borderradius * 0.5,
        padding: 10,
    },
    dateHeader: {
        color: c.secondary,
        fontSize: RFValue(10),
        fontFamily: Fonts.SemiBold,
        textAlign: "center", // Center the text
    },
    messageChat: {
        minWidth: "40%",
        borderRadius: borderradius * 1,
        backgroundColor: c.primary,
        alignItems: "center",
        justifyContent: "center",
        padding: "2%",
        alignSelf: "center",
        marginBottom: "3%"

    },
    backButton: {
        marginTop: "8%",
        left: "3%",
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        backgroundColor: "#fff",
        marginLeft: "3%",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.8%",

    },
    chatHeaderBar: {
        height: Platform.OS == "ios" ? "10%" : deviceheight * 0.1,
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
    },
    chatHeaderBackBtn: {
        width: devicewidth * 0.10,
        height: devicewidth * 0.10,
        borderRadius: (devicewidth * 0.15) / 2,
        padding: "4%",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: "3%",
        zIndex: 2,
    },
    chatHeaderAvatarBtn: {
        zIndex: 2,
    },
    chatHeaderAvatarFrame: {
        width: deviceheight * 0.075,
        height: deviceheight * 0.075,
        borderRadius: borderradius * 5,
    },
    chatHeaderAvatarImageWrap: {
        width: devicewidth * 0.14,
        height: devicewidth * 0.14,
    },
    chatHeaderAvatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: borderradius * 5,
    },
    chatHeaderTitleOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: devicewidth * 0.24,
        zIndex: 1,
    },
    chatHeaderTitle: {
        color: "#fff",
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(17),
        textAlign: "center",
    },
    chatHeaderSubtitle: {
        color: "#fff",
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13),
        textAlign: "center",
    },
    blockedContainer: {
        width: "90%",
        height: "18%",
        paddingTop: "2%",
        marginBottom: 10,
        borderRadius: borderradius * 0.50,
        backgroundColor: c.intermediate,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    Unlockbtn: {
        backgroundColor: c.secondary,
        width: devicewidth * 0.3,
        height: deviceheight * 0.05,
        borderRadius: borderradius * 0.2,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5
    }

});
