import React, { useState, useEffect } from 'react';
import MypageInfoStyle from './Mypage.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { callMypageGetSpreadAPI } from '../../apis/MypageinfoupdateAPI';
import { callMypageUpdateInfoAPI } from '../../apis/MypageinfoupdateAPI';
import { decodeJwt } from '../../utils/tokenUtils';


const accessToken = localStorage.getItem('accessToken');
const decodeToken = decodeJwt(accessToken);
const empCode = decodeToken?.empCode;


function MyPage() {
    const dispatch = useDispatch();    

    const [accessToken, setAccessToken] = useState();
    useEffect(()=>{
        setAccessToken(window.localStorage.getItem('accessToken'))
    },[])
    const mypageemps = useSelector((state) => state.mypagereducer);

    useEffect(() => {
        accessToken&&dispatch(callMypageGetSpreadAPI({ empCode: empCode}));
    }, [accessToken]);

    const timestamp = mypageemps.empInfo?.data?.empBirth;
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString();

    // 초기 상태 설정
    const [userInfo, setUserInfo] = useState({
        phone: '',
        empEmail: '',
        address: '',
    });

    useEffect(() => {
        setUserInfo({
            phone: mypageemps?.empInfo?.data?.phone || '',
            empEmail: mypageemps?.empInfo?.data?.empEmail || '',
            address: mypageemps?.empInfo?.data?.empAddress || '',
        });
    }, [mypageemps?.empInfo?.data]);
    // }, [mypageemps]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({
            ...userInfo,
            [name]: value,
        });
    };
console.log('수정한 사용자 정보 나오는지 ',JSON.stringify(userInfo) )

    const handleUpdate = () => {
        dispatch(callMypageUpdateInfoAPI({
            phone: userInfo?.phone,
            empEmail: userInfo?.empEmail,
            address: userInfo?.address,
            empCode: empCode
        })).then(() => {
            console.log('수정한 사용자 정보 여기 안에서도 나오는지 ',userInfo)
            alert('수정되었습니다.');
        }).catch((error) => {
            alert('수정 실패했습니다.');
            console.error('수정 중 오류가 발생했습니다:', error);
        });
    };


    return (
        <>
            <div className={MypageInfoStyle.myinfo_update}>
                <div className={MypageInfoStyle.myinfo_chart}>
                    <div className={MypageInfoStyle.myinfotext}>&lt;내 정보&gt;</div>
                    <h2>이름</h2>
                    <input type="text" value={mypageemps.empInfo?.data?.empName || ''} readOnly />
                    <h2>부서</h2>
                    <input type="text" value={mypageemps.empInfo?.data?.department?.departmentName || ''} readOnly />
                    <h2>생년월일</h2>
                    <input type="text" value={formattedDate} readOnly />
                    <h2>학력</h2>
                    <input type="text" value={ mypageemps.empInfo?.data?.education[0]?.educationName + ' / ' + mypageemps.empInfo?.data?.education[0]?.educationMajor || ''} readOnly />
                    <h2>경력</h2>
                    <input type="text" value={mypageemps.empInfo?.data?.career[0]?.careerCompanyName + ' / ' +  mypageemps.empInfo?.data?.career[0]?.careerBusinessInformation || ''} readOnly />
                    <h2>전화번호</h2>
                    <input
                        type="text"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleInputChange}
                    />
                    <h2>이메일</h2>
                    <input
                        type="text"
                        name="empEmail"
                        value={userInfo.empEmail}
                        onChange={handleInputChange}
                    />
                    <h2>주소</h2>
                    <input
                        type="text"
                        name="address"
                        value={userInfo.address}
                        onChange={handleInputChange}
                    />
                    <br />
                    <div className={MypageInfoStyle.update_btn}>
                        <button className={MypageInfoStyle.update_btn2} onClick={() => handleUpdate()} >수정하기</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyPage;

