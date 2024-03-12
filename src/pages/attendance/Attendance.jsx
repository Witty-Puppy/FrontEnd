
import commuteMa from './attendancePage/CmmuteMain.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { callCommuteMainAPI } from '../../apis/AttendanceAPI';
import { callCommutInsertAPI } from '../../apis/AttendanceAPI';
import { callCommuteUpdateAPI } from '../../apis/AttendanceAPI';

const getCurrentDateTime = () => {
    const now = new Date();
    return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
};

const padZero = (num) => num.toString().padStart(2, '0');

function Attendance() {

    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
    const [workTime, setWorkTime] = useState('');
    const [leaveTime, setLeaveTime] = useState('');
    const [current, setCurrent] = useState('출근전 입니다');
    const [worked, setWorked] = useState('');



    const vacationApplyClick = () => {
        // 휴가 신청 페이지로 이동
        navigate('/approval/writing');  //결재 휴가 페이지 넣기
    };

    const myPaymentClick = () => {
        // 결재 페이지로 이동
        navigate('/attendance/doPaymentDocumentWaiting')
    };

    const workApplyClick = () => {
        // 근태 신청 페이지로 이동
        navigate('/approval/writing');  //근태 신청 페이지 널기
    };

    const adminAttendance = () => {
        //관리자 페이지 이동
        navigate('/attendance/adminVacationList')
    };


    const arrivalTime = () => {

        if (!commuteName?.employeeName) {
            alert('로그인 해주세요.')
        }


        // 출근 여부 확인
        if (commuteMain?.attendanceManagementDepartureTime) {
            alert('이미 출근했습니다.');
            return;
        }

        // 현재 시간을 문자열로 가져와서 arrivalTime에 저장
        const currentTime = getCurrentDateTime();
        setWorkTime(currentTime);

        // 시, 분, 초 추출
        const [hours, minutes, seconds] = currentTime.split(' ')[1].split(':').map(Number);

        // API 호출 시 arrivalTime을 문자열로 전달
        dispatch(callCommutInsertAPI({
            arrivalTime: currentTime.replace(' ', 'T'), // ISO 형식으로 변경, 
            late: hours >= 9 && minutes >= 1 && seconds >= 0 // 9:01:00 이후면 지각으로 설정
        }));


        window.location.reload();

    };



    // 컴포넌트가 처음 렌더링될 때와 commuteMain이 변경될 때마다 실행
    useEffect(() => {
        if (commuteMain?.attendanceManagementDepartureTime) {
            setCurrent('출근 했습니다');
        }

        if (commuteMain?.attendanceManagementDepartureTime > commuteMain?.attendanceManagementArrivalTime) {
            setCurrent('퇴근 했습니다');
        }

    });


    const updateTime = () => {

        if (!commuteName?.employeeName) {
            alert('로그인 해주세요.')
        }


        if (!commuteMain?.attendanceManagementDepartureTime) {
            alert('출근 먼저 해주세요.');
            return;
        }


        if (commuteMain?.attendanceManagementArrivalTime && commuteMain?.attendanceManagementDepartureTime) {
            const arrivalTime = new Date(...commuteMain.attendanceManagementArrivalTime);
            const departureTime = new Date(...commuteMain.attendanceManagementDepartureTime);

            if (departureTime > arrivalTime) {
                alert('이미 퇴근했습니다.');
                return;
            }
        }

        // 현재 시간을 문자열로 가져와서 departureTime 저장
        const currentTime = getCurrentDateTime();
        setWorkTime(currentTime);

        // 시, 분, 초 추출
        const [hours, minutes, seconds] = currentTime.split(' ')[1].split(':').map(Number);

        // API 호출 시 arrivalTime을 문자열로 전달
        dispatch(callCommuteUpdateAPI({
            departureTime: currentTime.replace(' ', 'T'), // ISO 형식으로 변경, 
            early: hours <= 17 && minutes <= 59 && seconds <= 59

        }));

        window.location.reload();

    };



    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(getCurrentDateTime());
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);




    const dispatch = useDispatch();
    const attendanceMain = useSelector((state => state?.attendance));


    const commuteMain = attendanceMain?.data?.data;
    console.log('commuteMain =====>', commuteMain);

    const commuteVacation = attendanceMain?.data?.data2;
    console.log('commuteVacation =====>', commuteVacation);

    const commuteWaiting = attendanceMain?.data?.data3;
    console.log('commuteWaiting ========>', commuteWaiting);

    const commuteName = attendanceMain?.data?.data4;
    console.log('========= commuteName ===========', commuteName)



    useEffect(() => {
        dispatch(
            callCommuteMainAPI({})
        );
    }, []);

    function formatDateTime(dateTimeArray) {
        if (!dateTimeArray || !Array.isArray(dateTimeArray)) return ""; // 배열이 아니거나 값이 없으면 빈 문자열 반환

        // 배열의 길이가 충분하지 않으면 나머지 시간 정보를 0으로 설정하여 Date 객체 생성
        const year = dateTimeArray[0] || 0;
        const month = (dateTimeArray[1] || 0) - 1;
        const day = dateTimeArray[2] || 0;
        const hours = dateTimeArray[3] || 0;
        const minutes = dateTimeArray[4] || 0;
        const seconds = dateTimeArray[5] || 0;

        // Date 객체 생성
        const dateTime = new Date(year, month, day, hours, minutes, seconds);

        // 년, 월, 일, 시, 분, 초를 추출
        const formattedYear = dateTime.getFullYear();
        const formattedMonth = (dateTime.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1 해주고, 2자리로 만들기 위해 padStart 사용
        const formattedDay = dateTime.getDate().toString().padStart(2, '0');
        const formattedHours = dateTime.getHours().toString().padStart(2, '0');
        const formattedMinutes = dateTime.getMinutes().toString().padStart(2, '0');
        const formattedSeconds = dateTime.getSeconds().toString().padStart(2, '0');

        // "yyyy-MM-dd HH:mm:ss" 형식의 문자열로 반환
        return `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }











    return (

        <div className={commuteMa.main}>
            <div className={commuteMa.main2}>
                <span className={commuteMa.mainTitle}>내 근태 현황</span>
                {/* <button onClick={adminAttendance} className={commuteMa.admin}>관리자 페이지</button> */}
                {console.log(commuteVacation, 'commuteVacation')}
                <div className={commuteMa.bar}></div>
                <div className={commuteMa.box}>
                    <div className={commuteMa.vacation_box}>
                        <span className={commuteMa.vacation_leave}>남은 연차</span>
                        <span className={commuteMa.vacation_image}></span>
                        <div className={commuteMa.vacation2}>{commuteVacation?.resultVacation}</div>
                        <span className={commuteMa.vacation_day}>일</span>
                        <button onClick={vacationApplyClick} style={{ backgroundColor: '#FFBE98', border: 'none' }} className={commuteMa.vacation_apply}>휴가 신청하기</button>
                    </div>
                    <div className={commuteMa.payment_box}>
                        <span className={commuteMa.payment_leave}>결재 대기</span>
                        <span className={commuteMa.payment_image}></span>
                        <div className={commuteMa.payment}>{commuteWaiting?.countWaiting}</div>
                        <span className={commuteMa.payment_count}>건</span>
                        <button onClick={myPaymentClick} style={{ backgroundColor: '#FFBE98', border: 'none' }} className={commuteMa.payment_check}>결제 확인하기</button>
                    </div>
                    <div className={commuteMa.work_box}>
                        <span className={commuteMa.work_title}>근태 신청</span>
                        <span className={commuteMa.work_image}></span>
                        <button onClick={workApplyClick} style={{ backgroundColor: '#FFBE98', border: 'none' }} className={commuteMa.vacation_apply}>근태 신청하기</button>
                    </div>
                </div>
                <div className={commuteMa.today_Info_box}>
                    <div className={commuteMa.today_Info}>
                        <span className={commuteMa.today}>오늘</span>
                        <span className={commuteMa.today_time}>{currentDateTime}</span>
                        <hr className={commuteMa.hr} />
                        <div className={commuteMa.current_info}>
                            <span className="userN" >{commuteName?.employeeName}님 안녕하세요.</span><br />
                            <span className={commuteMa.current}>{current}</span>
                        </div>
                        <div className={commuteMa.time_info}>
                            <span className="workTime">출근: {formatDateTime(commuteMain?.attendanceManagementArrivalTime)}</span>
                            <br />
                            <span className="leaveTime">퇴근: {formatDateTime(commuteMain?.attendanceManagementDepartureTime)}</span>
                            <input type="hidden" value={leaveTime} />
                        </div>
                        <button id="workCheckButton" className={commuteMa.work_check} onClick={arrivalTime}>출근</button>
                        <button id="leaveCheckButton" className={commuteMa.leave_check} onClick={updateTime}>퇴근</button>
                        <span className={commuteMa.worked}>{worked}</span><br />
                    </div>
                </div>

            </div>
        </div>
    );

}

export default Attendance;