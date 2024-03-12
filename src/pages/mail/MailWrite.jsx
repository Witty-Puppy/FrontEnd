import { useEffect, useState } from 'react';
import style from './mailWrite.module.css';
import { fet, fetObj, sendMails } from '../../apis/MailAPI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../component/WebSocketContext';
import { useAlert } from '../../component/common/AlertContext';
import { useDispatch } from 'react-redux';
import { decodeJwt } from '../../utils/tokenUtils';

function MailWrite() {
    window.jQuery = require('jquery');
    const { showAlert } = useAlert();
    const dispatch = useDispatch();

    const wc = useWebSocket();
    const navigate = useNavigate();
    const RichTextEditor = require('../../component/common/SummerNote').default;
    const [reserveDate, setReserveDate] = useState('');  //선택한 예약 날짜
    const [receiver, setReceiver] = useState('');
    const [title, setTitle] = useState('');
    const [isSendMe, setIsSendMe] = useState(false);
    const [content, setContent] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [files, setFiles] = useState([]);
    const [fileSize, setFileSize] = useState(0);
    const location = useLocation();
    const [token, setToken] = useState('');

    useEffect(() => {
        if (location.state) {
            if (!isNaN(location.state.emailCode)) {
                setEmailCode(location.state.emailCode);
                fet(`http://${process.env.REACT_APP_RESTAPI_IP}:1208/mail/find-email-by-code?emailCode=${emailCode}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 200) {
                            console.log(data);
                            setReceiver(data.data.emailSender.employeeId);
                            setTitle(`re : ${data.data.emailTitle} `);
                        }
                    })
            } else if (location.state === 'sendMe') {
                setIsSendMe(true);
                setReceiver('나에게 발송합니다.');
            }
        }
    }, [location, emailCode])

    useEffect(() => {
        setToken(decodeJwt(window.localStorage.getItem('accessToken')));
    }, [])

    const sendEmail = (status) => {   //이메일 보내기 버튼 눌럿을 때
        if (title && receiver) {          //insert작업인데 @MessageMapping으로 보내야한다.
            switch (status) {
                case 'send':
                    if (wc) { //웹 소켓이 연결되어있으면
                        wc.publish({
                            destination: '/app/mail/alert/send',    //엔드포인트
                            headers: { Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') },
                            body: JSON.stringify({
                                emailTitle: title,
                                emailContent: content,
                                emailReceiver: {
                                    employeeId: receiver + '@witty.com'
                                }
                            })
                        });
                        const formData = new FormData();
                        // 각 파일을 formData에 추가
                        files.forEach((file, index) => {
                            formData.append(`multipartFile`, file);
                        });

                        formData.append(`emailTitle`, title);
                        formData.append(`emailContent`, content);
                        if (receiver === '나에게 발송합니다.') {
                            formData.append(`emailReceiver.employeeId`, `${token.employeeId}@witty.com`);    //받는 사람을 나로ㄲ
                        } else {
                            formData.append(`emailReceiver.employeeId`, `${receiver}@witty.com`);    //받는 사람을 타인으로 ㄲ
                        }


                        dispatch(sendMails(formData));
                        navigate('/mail/check');
                    } else {    //웹소켓이 연결되어있지 않으면?
                        showAlert('웹소켓과 연결되지 않은 상태입니다.');
                    }
                    break;
                case 'reserve':
                    if (reserveDate === '') {
                        showAlert('메일이 도착했습니다.')
                    } else {
                        const emailDTO = {
                            emailTitle: title,
                            emailContent: content,
                            emailReservationTime: reserveDate,
                            emailReceiver: {
                                employeeId: receiver + '@witty.com'
                            }
                        }
                        fetObj(`http://${process.env.REACT_APP_RESTAPI_IP}:1208/mail/send-reserve-mail`, 'POST', emailDTO);
                        navigate('/mail/check');
                    }
                    break;
                case 'temporary':
                    showAlert("업데이트 예정입니다.");
                    break;
                default: break;
            }
        } else {
            showAlert('받는 이 또는 제목이 비어있습니다.');
        }

    }
    const dateChangeHandler = (e) => {  //예약 전송 날짜 바꿔주기

        const date = new Date(e.target.value);
        if (date < new Date()) {
            showAlert("지금보다 전 날짜는 선택할 수 없습니다.");
        } else {
            setReserveDate(e.target.value);
        }
    }
    const receiverChangeHandler = (e) => {  //누구한테 보낼 건지 바꿔주기
        setReceiver(e.target.value);
    }
    const titleChangeHandler = (e) => { //제목 바꿔주기
        setTitle(e.target.value);
    }
    const sendMeChangeHandler = (e) => {    //내게 쓰기로 바꿔주기
        setIsSendMe(e.target.checked ? true : false);
        setReceiver(e.target.checked ? '나에게 발송합니다.' : '');
    }
    const handleContent = (e) => {  //섬머노트에 쓴거
        setContent(e);
    }
    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
        console.log(e.target.files[0]);
        const file = e.target.files[0]; // 사용자가 선택한 첫 번째 파일

        if (file) {
            const sizeInBytes = file.size; // 파일 크기를 바이트 단위로 가져옴
            const sizeInKB = sizeInBytes / 1024; // 킬로바이트 단위로 변환
            const sizeInMB = sizeInKB / 1024; // 메가바이트 단위로 변환

            // 파일 크기를 상태에 설정 (예: "2.4 MB")
            setFileSize(`${sizeInMB.toFixed(2)} MB`);
        }
    }

    useEffect(() => {

    }, [content])

    return (
        <>
            <div className={style.container}>
                <div className={style.title}>메일 쓰기</div>
                <hr className={style.customHr} />
                <button onClick={() => { sendEmail('send') }} className={style.sendButton}>보내기</button>
                <button onClick={() => { sendEmail('reserve') }} className={style.reserveSend}>예약 전송</button>
                <input onChange={(e) => { dateChangeHandler(e) }} type="datetime-local" className={style.inputDate} value={reserveDate} />
                <button onClick={() => { sendEmail('temporary') }} className={style.temporarySave}>임시저장</button>
                <hr />
                <span className={style.receiverText}>받는 사람</span>
                <input disabled={isSendMe} onChange={(e) => { receiverChangeHandler(e) }} className={style.receiverInput} type="text" placeholder='누구에게 보내시나요?' value={receiver} />{!isSendMe ? <span style={{ marginLeft: '10px' }}>@witty.com</span> : <></>}
                <span className={style.sendMeText}>내게쓰기</span><input checked={isSendMe} className={style.sendMeCheckBox} onChange={(e) => { sendMeChangeHandler(e) }} type="checkbox" />
                <br />
                <span className={style.titleText}>제 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 목</span>
                <input onChange={(e) => { titleChangeHandler(e) }} value={title} className={style.titleInput} type="text" checked={isSendMe} placeholder='제목을 입력하세요.' /><br />
                <input onChange={handleFileChange} multiple className={style.fileInput} type="file" /><span>{fileSize}</span><hr />
                <RichTextEditor content={content} onContentChange={(e) => { handleContent(e) }} />
            </div>
        </>
    )
}

export default MailWrite;