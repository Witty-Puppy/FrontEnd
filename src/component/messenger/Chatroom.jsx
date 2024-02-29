import { useEffect, useRef, useState } from 'react';
import styles from './chatroom.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { callChangeChatroomProfileAPI, callFindChatListAPI, callGetChatroomAPI, callGetEmployeesAPI, callGetMessengerMainAPI, callGetPrevChats, callInviteChatroomMemberAPI, callLeaveChatroomAPI, callUpdateChatReadStatus } from '../../apis/MessengerAPICalls';
import { userEmployeeCode } from '../../utils/tokenUtils';
import { format } from 'date-fns';
import { useWebSocket } from '../WebSocketContext';
import { RESET_SCROLLING_TO_CHATCODE, RESET_SHOW_RECEIVED_CHAT } from '../../modules/MessengerModule';

function Chatroom({ chatroomList, setIsChatroomOpen, chatroomCode, setChatroomCode }) {
    const websocket = useWebSocket();
    const messengerData = useSelector(state => state.messenger);
    const [isInviteWindow, setIsInviteWindow] = useState(false);
    const [isSearchInput, setIsSearchInput] = useState(false);
    const dispatch = useDispatch();
    const [searchList, setSearchList] = useState([]);
    const [searchPageInfo, setSearchPageInfo] = useState(null);
    const [pageRange, setPageRange] = useState([]);

    const [chatList, setChatList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [oldEmployeeList, setOldEmployeeList] = useState([]);
    const [oldEmployeeCodeList, setOldEmployeeCodeList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [isMemberWindow, setIsMemberWindow] = useState(false);
    const profileInputRef = useRef(null);
    const [chatTextValue, setChatTextValue] = useState('');

    const [flag, setFlag] = useState(true);

    const chatContainerRef = useRef(null);
    useEffect(() => {
        setSearchList(messengerData?.findChatList?.data);
        setSearchPageInfo(messengerData?.findChatList?.pageInfo);
    }, [messengerData?.findChatList])

    useEffect(() => {
        const pageStart = searchPageInfo?.pageStart;
        const pageEnd = searchPageInfo?.pageEnd;
        const range = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => index + pageStart)
        setPageRange(range)
    }, [searchList, searchPageInfo])
    useEffect(() => {
        if (messengerData?.scrollingToChatCode) {
            dispatch({ type: RESET_SCROLLING_TO_CHATCODE })
        }
    }, [chatroomList])
    const chatTextValueHandler = (e) => {
        setChatTextValue(e.target.value);
    }
    const sendChatHandler = () => {
        const chatroomCode = messengerData?.chatroomData?.chatroomCode;

        websocket?.publish({
            destination: `/app/messenger/chatrooms/${chatroomCode}/send`,
            headers: { Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') },
            body: JSON.stringify({
                chatContent: chatTextValue,
                chatFileName: '파일이름이다.',
                chatFile: '사진데이터',
                isFileSend: 'N'
            })
        })

        setChatTextValue('');
    }

    const resetSearchNameHandler = (e) => {
        setSearchName('');
    }
    const searchNameHandler = (e) => {
        setSearchName(e.target.value);
    }
    const chatLoadingHandler = (e) => {
        const minChatCode = chatList?.reduce((min, chat) => Math.min(min, chat?.chatCode), Infinity);
        dispatch(callGetPrevChats({ chatroomCode, minChatCode }))
    }
    useEffect(() => {
        isSearchInput && findChatHandler();
    }, [isSearchInput])
    const searchButtonHandler = () => {
        setIsSearchInput(!isSearchInput)
        setIsInviteWindow(false);
        setIsMemberWindow(false);
    }
    const exitInviteHandler = () => {
        setIsInviteWindow(false);
        setIsMemberWindow(false);
    }

    const inviteHandler = (employeeCode) => {
        dispatch(callInviteChatroomMemberAPI({ chatroomCode, employeeCode, websocket }))

        websocket?.publish({
            destination: `/app/messenger/chatrooms/${chatroomCode}/invite`,
            headers: { Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') },
            body: JSON.stringify({
                employeeCode
            })
        })
    }
    useEffect(() => {
        messengerData?.employees && setEmployeeList(messengerData?.employees);
    }, [messengerData?.employees])
    useEffect(() => {
        isInviteWindow && dispatch(callGetEmployeesAPI());
    }, [isInviteWindow])
    useEffect(() => {
        oldEmployeeList
            && setOldEmployeeCodeList(oldEmployeeList?.map(oldEmployee => oldEmployee?.employeeCode));
    }, [oldEmployeeList]);
    useEffect(() => {
        chatroomCode
            && dispatch(callGetChatroomAPI({ chatroomCode }))
    }, [])

    useEffect(() => {
        messengerData?.chatroomData?.chatList && setChatList(messengerData?.chatroomData?.chatList)
    }, [messengerData?.chatroomData?.chatList])
    useEffect(() => {
        if (flag && chatList?.length) {
            const maxChatCode = Math.max(...chatList.map(chat => chat.chatCode));
            dispatch(callUpdateChatReadStatus({ chatroomCode, maxChatCode }));
            setFlag(false);
        }
    }, [chatList])
    useEffect(() => {
        const chatroomMemberList = messengerData?.chatroomData?.chatroomMemberList;
        setOldEmployeeList(chatroomMemberList?.map(chatroomMember => chatroomMember?.employee))
    }, [messengerData?.chatroomData?.chatroomMemberList])
    const inviteWindowHandler = () => {
        setIsInviteWindow(!isInviteWindow);
        setIsSearchInput(false);
    }
    const exitHandler = () => {
        dispatch(callGetMessengerMainAPI())
        setIsChatroomOpen(false);
        setChatroomCode(null);
    }
    const memberWindowHandler = () => {
        setIsMemberWindow(true);
        setIsInviteWindow(false);
    }
    const profileClickHandler = () => {
        profileInputRef.current.click();
    }
    const profileChangeHandler = (e) => {
        const file = e.target.files[0];
        dispatch(callChangeChatroomProfileAPI({ chatroomCode, file }))
    }
    const scrollingToBottomButtonHandler = () => {
        dispatch({ type: RESET_SHOW_RECEIVED_CHAT })
        dispatch({ type: RESET_SCROLLING_TO_CHATCODE })
    }
    const leaveChatroomHandler = () => {
        const result = window.confirm('정말로 채팅방에 나가시겠습니까?');
        result && dispatch(callLeaveChatroomAPI({ chatroomCode }))
        result && setIsChatroomOpen(false);
    }
    const findChatHandler = () => {
        dispatch(callFindChatListAPI({ chatroomCode, searchValue }))
    }
    const [searchValue, setSearchValue] = useState('');
    const searchValueHandler = (e) => {
        setSearchValue(e.target.value);
    }
    const searchBodyRef = useRef();
    const paging = (searchValue, offset) => {
        searchBodyRef.current.scrollTop = 0;
        dispatch(callFindChatListAPI({ chatroomCode, searchValue, offset }))
    }
    return (
        <>
            <div className={styles.chatroom_main}>
                {isInviteWindow && (<div className={styles.chatroom_invite_wrap}>
                    <img
                        src="/messenger/x_dark.png"
                        alt="닫기"
                        className={styles.invite_exit}
                        onClick={exitInviteHandler}
                    />
                    <div className={styles.chatroom_invite}>
                        <div className={styles.messenger_member_search}>
                            <label>검색</label>
                            <input type='button' value='x'
                                onClick={resetSearchNameHandler} />
                            <input type='text'
                                value={searchName}
                                onChange={searchNameHandler} />
                        </div>
                        <div className={styles.messenger_member_list}>
                            <table>
                                <tbody>
                                    {employeeList
                                        ?.filter(employee => {
                                            return (employee?.employeeName?.includes(searchName)
                                                && !oldEmployeeCodeList.includes(employee?.employeeCode));
                                        })?.map((employee) => {
                                            return (
                                                <tr key={employee?.employeeCode}>
                                                    <td>
                                                        <div className={styles.member_buttons}>
                                                            {(userEmployeeCode() === employee?.employeeCode) && <input type='button' value='나가기' />}
                                                            {(!oldEmployeeCodeList.includes(employee?.employeeCode)) && <input
                                                                type='button'
                                                                value='초대하기'
                                                                onClick={() => inviteHandler(employee?.employeeCode)}
                                                            />}
                                                        </div>
                                                        <div className={styles.member_info}>
                                                            <div className={styles.member_list_img_and_name}>
                                                                <img
                                                                    src={(employee?.profileList && employee.profileList[0]?.profileChangedFile) ? `http://${process.env.REACT_APP_RESTAPI_IP}:1208/web-images/${employee.profileList[0]?.profileChangedFile}` : `/profile1.png`}
                                                                    alt='멤버사진'
                                                                />
                                                                <span>{employee?.employeeName}</span>
                                                            </div>
                                                            <div className={styles.member_list_dept_and_position}>
                                                                <span>{employee?.department?.departmentName}</span>
                                                                <span>{employee?.job?.jobName}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>)
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}
                {isMemberWindow && (<div className={styles.chatroom_invite_wrap}>
                    <img
                        src="/messenger/x_dark.png"
                        alt="닫기"
                        className={styles.invite_exit}
                        onClick={exitInviteHandler}
                    />
                    <div className={styles.chatroom_invite}>
                        <div className={styles.messenger_member_search}>
                            <label>검색</label>
                            <input type='button' value='x'
                                onClick={resetSearchNameHandler} />
                            <input type='text'
                                value={searchName}
                                onChange={searchNameHandler} />
                        </div>
                        <div className={styles.messenger_member_list}>
                            <table>
                                <tbody>
                                    {oldEmployeeList
                                        ?.filter(employee => {
                                            return (employee?.employeeName?.includes(searchName));
                                        })?.map((employee) => {
                                            return (
                                                <tr key={employee?.employeeCode}>
                                                    <td>
                                                        <div className={styles.member_buttons}>
                                                            {employee?.employeeCode === userEmployeeCode()
                                                                && <input type='button' value='나가기' onClick={leaveChatroomHandler} />}
                                                        </div>
                                                        <div className={styles.member_info}>
                                                            <div className={styles.member_list_img_and_name}>
                                                                <img
                                                                    src={employee?.profileList ? `http://${process.env.REACT_APP_RESTAPI_IP}:1208/web-images/${employee.profileList[0]?.profileChangedFile}` : `/profile1.png`}
                                                                    alt='멤버사진'
                                                                />
                                                                <span>{employee?.employeeName}</span>
                                                            </div>
                                                            <div className={styles.member_list_dept_and_position}>
                                                                <span>{employee?.department?.departmentName}</span>
                                                                <span>{employee?.job?.jobName}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>)
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}
                {isSearchInput && <div className={styles.chatroom_search}>
                    <div className={styles.search_wrap}>
                        <input type='button' value='검색' onClick={findChatHandler} />
                        <input type='text' placeholder='내용 입력' value={searchValue} onChange={searchValueHandler} />
                    </div>
                    <div className={styles.page_selector}>
                        <button
                            disabled={
                                searchPageInfo?.cri?.pageNum === 1 ||
                                searchPageInfo?.total === 0
                            }
                            onClick={() => {
                                paging(searchValue, 1)
                            }}
                        >
                            &lt;&lt;
                        </button>
                        <button
                            disabled={!searchPageInfo?.prev}
                            onClick={() => {
                                paging(searchValue, searchPageInfo?.cri?.pageNum - 1)
                            }}
                        >
                            &lt;
                        </button>
                        {pageRange?.map(page => {
                            return (
                                <button
                                    key={page}
                                    style={{
                                        backgroundColor: searchPageInfo?.cri?.pageNum === page ? "hsl(12, 92%, 85%)" : ""
                                    }}
                                    onClick={() => {
                                        paging(searchValue, page)
                                    }}
                                >
                                    {page}
                                </button>
                            )
                        })}
                        <button
                            disabled={!searchPageInfo?.next}
                            onClick={() => {
                                paging(searchValue, searchPageInfo?.cri?.pageNum + 1)
                            }}
                        >
                            &gt;
                        </button>
                        <button
                            disabled={
                                searchPageInfo?.cri?.pageNum === searchPageInfo?.realEnd ||
                                searchPageInfo?.total === 0
                            }
                            onClick={() => {
                                paging(searchValue, searchPageInfo?.realEnd)
                            }}
                        >
                            &gt;&gt;
                        </button>
                    </div>
                    <div className={styles.search_body} ref={searchBodyRef}>
                        {searchList?.map(chat => {
                            return (
                                <div className={styles.chat_element}
                                    key={chat?.chatCode}
                                    id={`chat_${chat?.chatCode}`}>
                                    <img src={chat?.chatroomMember?.employee?.profileList
                                        ? (chat?.chatroomMember?.employee?.profileList[0]?.profileChangedFile
                                            ? `http://${process.env.REACT_APP_RESTAPI_IP}:1208/web-images/${chat?.chatroomMember?.employee?.profileList[0]?.profileChangedFile}`
                                            : `/profile1.png`)
                                        : `/profile1.png`}
                                        alt="프로필사진" className={styles.chat_element_row_1} />
                                    <div className={styles.chat_element_row_2}>
                                        <div className={styles.sender}>
                                            {chat?.chatroomMember?.employee?.employeeName}
                                        </div>
                                        <div className={styles.letter}>
                                            {chat?.chatContent}
                                        </div>
                                    </div>
                                    <div className={styles.chat_element_row_3}>
                                        {format(chat?.chatWriteDate, "yyyy-MM-dd HH:mm", { timeZone: 'Asia/Seoul' })}
                                    </div>
                                </div>)
                        })}
                    </div>
                </div>}
                <div className={styles.chatroom_header}>
                    <img src={messengerData?.chatroomData?.chatroomProfileFileURL ? `http://${process.env.REACT_APP_RESTAPI_IP}:1208/web-images/${messengerData?.chatroomData?.chatroomProfileFileURL}` : '/messenger/chatroom_profile.png'}
                        alt="채팅방프로필" className={styles.chatroom_header_1}
                        onClick={profileClickHandler} />
                    <input
                        type="file"
                        ref={profileInputRef}
                        style={{ display: 'none' }}
                        onChange={profileChangeHandler}
                    />
                    <div className={styles.chatroom_header_2}>
                        <div className={styles.chatroom_title}>{messengerData?.chatroomData?.chatroomTitle}</div>
                        <div className={styles.chatroom_member_count}>
                            <img src="/messenger/member_count.png" alt="인원"
                                onClick={memberWindowHandler} />
                            <span>{messengerData?.chatroomData?.chatroomMemberList?.length}</span>
                        </div>
                    </div>
                    <div className={styles.chatroom_additional}>
                        <img src="/messenger/member_invite.png" alt="초대"
                            onClick={inviteWindowHandler} />
                        <img src="/messenger/chat_search.png" alt="검색"
                            onClick={searchButtonHandler} />
                    </div>
                    <img
                        src="/messenger/x_dark.png"
                        alt="닫기"
                        className={styles.exit}
                        onClick={exitHandler} />
                </div>
                <div className={styles.chatroom_body}>
                    <div ref={chatContainerRef} className={styles.chat_body_text}>
                        <div className={styles.chat_elements_paging}>
                            <img src="/messenger/arrowToTop.png" alt="이전 채팅 불러오기" onClick={chatLoadingHandler} />
                        </div>
                        {chatList?.map(chat => {
                            return (
                                <div className={`${chat?.chatroomMember?.employee?.employeeCode !== userEmployeeCode() ? styles.chat_element : styles.chat_element_me} ${messengerData?.chatroomData?.lastReadChatCode === chat?.chatCode ? styles.read_status : ''}`}
                                    key={chat?.chatCode}
                                    id={`chat_${chat?.chatCode}`}>
                                    {chat?.chatroomMember?.employee?.employeeCode !== userEmployeeCode() && <img src={chat?.chatroomMember?.employee?.profileList
                                        ? (chat?.chatroomMember?.employee?.profileList[0]?.profileChangedFile
                                            ? `http://${process.env.REACT_APP_RESTAPI_IP}:1208/web-images/${chat?.chatroomMember?.employee?.profileList[0]?.profileChangedFile}`
                                            : `/profile1.png`)
                                        : `/profile1.png`}
                                        alt="프로필사진" className={styles.chat_element_row_1} />}
                                    <div className={styles.chat_element_row_2}>
                                        <div className={styles.sender}>
                                            {chat?.chatroomMember?.employee?.employeeName}
                                        </div>
                                        <div className={styles.letter}>
                                            {chat?.chatContent}
                                        </div>
                                    </div>
                                    <div className={styles.chat_element_row_3}>
                                        {format(chat?.chatWriteDate, "yyyy-MM-dd HH:mm", { timeZone: 'Asia/Seoul' })}
                                        <br />
                                        {messengerData?.chatroomData?.lastReadChatCode === chat?.chatCode ? '[최근에 읽은 채팅]' : ''}
                                    </div>
                                </div>)
                        })}
                    </div>
                    <div className={styles.chatroom_body_write_wrap}>
                        <textarea className={styles.chatroom_body_write}
                            value={chatTextValue}
                            onChange={chatTextValueHandler} />
                        <div className={styles.chatroom_body_write_button_wrap}>
                            <input type="button" value="전송" className={styles.submit}
                                onClick={sendChatHandler} />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Chatroom;