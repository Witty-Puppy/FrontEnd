import { useNavigate } from "react-router-dom";
import { POST_LOGOUT } from "../../modules/EmployeeModules";
import { useDispatch, useSelector } from "react-redux";
import { callLogoutAPI } from "../../apis/EmployeeAPICalls"; // 로그아웃 API 함수를 불러옵니다.
import './Main.css';
import { decodeJwt } from "../../utils/tokenUtils";
import { useEffect, useState } from "react";
import { useAlert } from "../../component/common/AlertContext";
import axios from "axios";
import { callAttendenceAPI, getMailToMain } from "../../apis/MainAPI";
import { callGetProjectsAPI } from "../../apis/ProjectAPICalls";
import { format } from 'date-fns';
import { callCommuteMainAPI } from '../../apis/AttendanceAPI';
import { insertCommuteAPI, updateCommuteAPI } from '../../apis/AttendanceAPI';

function Main() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const [active, setActive] = useState(false);
  const [token, setToken] = useState('');                   //토큰
  const [isLogin, setIsLogin] = useState(false);            //로그인 상태
  const [isAttendance, setIsAttendance] = useState(false);  //출퇴근 상태
  const [date] = useState(new Date());
  const [weather, setWeather] = useState();






  //포스트 가져오기
  const mainPost = useSelector(state => state.mainPost);
  // const error = useSelector(state=>state.error);
  const [isPostLoading, setIsPostLoading] = useState(false);

  useEffect(() => {
    if (mainPost && mainPost.data && Array.isArray(mainPost.data)) {
      setIsPostLoading(true);
    }
  }, [mainPost])




  //프로젝트 가져오기
  const mainProject = useSelector(state => {
    return state.project.projectListWithPaging?.data
  });
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  useEffect(() => {
    if (mainProject && Array.isArray(mainProject)) {
      setIsProjectLoading(true);
    }
  }, [mainProject])





  //날씨 가져오기
  const getWeather = async () => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=d752103e84b491cf9c2e6225a20d6f08`
      );
      const weatherId = res.data.weather[0].main;
      const weatherIcon = res.data.weather[0].icon;
      const weatherIconAdrs = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
      const temp = Math.round(res.data.main.temp);
      setWeather({
        description: weatherId,
        name: 'Seoul',
        temp: temp,
        icon: weatherIconAdrs,
      });
    } catch (err) {
      console.error('에러', err);
    }
  };


  useEffect(() => {
    setActive(true)
    if (window.localStorage.getItem('accessToken')) {
      setToken(decodeJwt(window.localStorage.getItem('accessToken')));
      setIsLogin(true);
    }
    getWeather();
    //post 가져오는 dispatch
    dispatch(getMailToMain());  //post 얻어오기 내가 쓴 글만 나옴. 게시판 완성하면 백엔드 수정 ㄱ limit 4개 
    const projectType = 'all';
    const searchValue = '';
    dispatch(callGetProjectsAPI({ projectType, searchValue }));
    // callAttendenceAPI();
    //출근 상태 얻어와서 set ㄱㄱ출근 시간도 같이 가져오자 가져온 시간에서 2시간 정도가 안지났으면 퇴근 못하게
    //결재 대기, 완료 개수 ㄱ
    //프로젝트 ㄱㄱ
  }, [])

  //로그인 버튼 눌렀을 때
  const showLoginPage = () => {
    navigate("/");
  };


  //   // 로그아웃 버튼 클릭 시 처리하는 함수
  const handleLogout = async () => {
    try {
      await callLogoutAPI();
      setIsAttendance(false);
      setIsLogin(false);
      localStorage.removeItem("accessToken");
      dispatch({ type: POST_LOGOUT, payload: {} });
      // window.location.reload();//이건 
      showAlert('로그아웃 되었습니다.');
      navigate('/login')
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };



  const attendanceMain = useSelector((state => state.attendance));


  const commuteMain = attendanceMain?.data?.data;
  console.log('commuteMain =====>', commuteMain);

  useEffect(() => {
    dispatch(
      callCommuteMainAPI({})
    );
  }, []);


  useEffect(() => {
    const arrivalTime = commuteMain?.attendanceManagementArrivalTime;
    const departureTime = commuteMain?.attendanceManagementDepartureTime;

    if (commuteMain?.attendanceManagementDepartureTime) {
      setIsAttendance(true); // 퇴근 상태로 설정

    }
    if (arrivalTime < departureTime) {
      setIsAttendance(false); // 출근 상태로 설정
    }

  }, [commuteMain?.attendanceManagementDepartureTime]); // commuteMain?.attendanceManagementDepartureTime 값이 변경될 때만 실행



  const changeAttendance = (status) => {
    const arrivalTime = commuteMain?.attendanceManagementArrivalTime;
    const departureTime = commuteMain?.attendanceManagementDepartureTime;

    if (status === 'leaving') {

      if (arrivalTime > departureTime) {

        dispatch(updateCommuteAPI({}));
        setIsAttendance(false); // 퇴근 상태로 변경
        window.location.reload();
      } else {
        alert('이미 퇴근 했습니다.');
        return;
      }


    } else {
      if (commuteMain?.attendanceManagementDepartureTime) {
        alert('이미 출근 했습니다.');
        return;
      } else {
        if (commuteMain?.attendanceManagementArrivalTime) {
          dispatch(insertCommuteAPI({}));
          setIsAttendance(true); // 출근 상태로 변경

        }
      }


    }
  };




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
    <>
      <div className={`fade-in mail_wrapper ${active ? 'active' : ''}`}>
        <div className="main">
          <section className="main_section">
            <div className="main_header">
              <div className="pay_box">
                <div className="pay_wait_box">
                  결재 대기 : <span id="payCount">3</span> 건
                </div>
                <div className="pay_completed_box">
                  결재 완료 : <span id="payCompletedCount">3</span> 건
                </div>
                <button onClick={() => { navigate('/approval') }} className="pay_more_btn" >더보기</button>
              </div>
              {isLogin ? (
                <div className="mypage_box">
                  <span className="mypage_name">{token.employeeName}</span><span className="main-name-text">님 환영합니다!</span>
                  <input onClick={() => { navigate('./mypage/mypageinfo') }} className="mypage_btn" type="button" value="MyPage" />
                  <button className="main-logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <div className="mypage_box">
                  <></>
                </div>
              )

              }
            </div>

            <div className="main_body">
              <div className="main_list_wrap">
                <div className="main_list_01 ">
                  <div className="list_name1">&lt;게시판&gt;</div>
                  <div className="table_height">
                    <table className="group-table2">
                      <thead>
                        <tr>
                          <th>게시글번호</th>
                          <th>내용</th>
                          <th>부서</th>
                          <th>날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isPostLoading ?
                          (
                            mainPost.data.slice(0, 4).map((post, index) => (
                              <tr key={post.postCode} className="main-posts-tr" onClick={() => { navigate(`./board/posts/${post.postCode}`) }}>
                                <td>{post.postCode}</td>
                                <td>{post.postTitle.length < 15 ? post.postTitle : post.postTitle.substring(0, 15) + "..."}</td>
                                <td>{post.postViews}</td>
                                <td>{post.postDate[0]}년 {post.postDate[1]}월 {post.postDate[2]}일</td>
                              </tr>
                            ))
                          ) : <tr><td colSpan={4}>아무 것도 없습니다..</td></tr>}

                      </tbody>
                    </table>
                  </div>

                </div>
                {isLogin ? (
                  <div className="main_list_02">
                    <div className="list_name2">&lt;근태&gt;</div>

                    <div className="attendance-box">
                      <div className="date-box">
                        <p>{date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일"}</p>
                        <hr />
                      </div>

                      <div className="button-container">
                        {isAttendance ? (
                          <button style={{ background: 'cornflowerblue' }} onClick={() => { changeAttendance('leaving') }} className="round-button round-button2">퇴근하기</button>
                        ) : (
                          <button style={{ background: '#fa9a85' }} onClick={() => { changeAttendance('go') }} className="round-button">출근하기</button>
                        )
                        }
                      </div>
                      {isAttendance ? (<p className="message">{formatDateTime(commuteMain?.attendanceManagementArrivalTime)}에 출근하셨습니다.</p>)
                        : (<p className="message">{token.employeeName}님 퇴근 상태입니다.</p>)}
                      <type value={commuteMain?.attendanceManagementDepartureTime} />
                    </div>

                  </div>)
                  :
                  (<div className="main_list_02">
                    <div className="list_name2">Login</div>
                    <div className="attendance-box">
                      <div className="date-box">
                        <p className="main-date-now" >{date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일"}</p>
                        <hr />
                      </div>
                      <div className="button-container">
                        <button onClick={showLoginPage} className="round-button round-button2">로그인 하기</button>
                      </div>
                      <p className="message">{token.employeeName}로그인 해주세요.</p>
                    </div>
                  </div>)
                }
                <div className="main_list_03">
                  <div className="list_name3" >&lt;프로젝트&gt;</div>

                  <div className="project_table_height">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>게시글번호</th>
                          <th>내용</th>
                          <th>부서</th>
                          <th>날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isProjectLoading ? (mainProject?.map((project) => (
                          <tr onClick={() => { navigate(`/projects/${project.projectCode}`) }} key={project.projectCode}>
                            <td>{project.projectCode}</td>
                            <td>{project.projectTitle}</td>
                            <td>{project.projectManagerDeptName}</td>
                            <td>{format(project.projectDeadline, "yyyy-MM-dd", { timeZone: 'Asia/Seoul' })}</td>
                          </tr>
                        ))
                        ) : (
                          <tr>
                            <td>로그인 해주세요.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                <div className="main_list_04">
                  <div className="list_name4">&lt;서울&gt;</div>
                  {weather ? (
                    <div className="weather-container">
                      <h2>현재 날씨</h2>
                      <img src={weather.icon} alt="날씨 아이콘" className="weather-icon" id="weatherIcon" />
                      <p id="temperature">기온 : {Math.round(weather.temp - 273.15)}°C</p>
                      <p id="weatherStatus">날씨 : {weather.description}</p>
                    </div>
                  ) : (
                    <div>..로딩중</div>
                  )}
                </div>

              </div>
            </div>


          </section>
        </div>
      </div>
    </>
  );
}

export default Main;
