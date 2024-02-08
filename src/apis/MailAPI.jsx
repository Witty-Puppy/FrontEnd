// import {GET_MAIL} from '../modules/MailModule';
// import datas  from '../testdata/userInfor'

// export const getMail = () => (dispatch) => {
//     alert("MailAPI옴");
//     console.log(datas);
//     dispatch({type: GET_MAIL, payload: datas});
// }
import { useNavigate } from "react-router-dom";
import { fail, request, success } from "../modules/MailModule";



export const fetchMailByStatus = (status) =>{
    return dispatch => {
        const token = 'eyJkYXRlIjoxNzA3MjY3MTk2NDIxLCJ0eXBlIjoiand0IiwiYWxnIjoiSFMyNTYifQ.eyJlbXBsb3llZU5hbWUiOiLsoJXsp4DshK0iLCJzdWIiOiJyb290IiwiZW1wbG95ZWVFbWFpbCI6IndqZHdsdGpxODQ4MkBnbWFpbC5jb20iLCJleHAiOjE3MDczMDMxOTYsImVtcGxveWVlUm9sZSI6W3siZW1wbG95ZWVObyI6MCwiYXV0aG9yaXR5Q29kZSI6MiwiYXV0aG9yaXR5Ijp7ImF1dGhvcml0eUNvZGUiOjIsImF1dGhvcml0eU5hbWUiOiJST0xFX0FETUlOIiwiYXV0aG9yaXR5RGVzYyI6Iuq0gOumrOyekCJ9fV19.HgsJESI1u7CQo7kHmnGEPJt7cw80-2eNcxdnWewzvhU';
        dispatch(request());
        fetch(`http://localhost:1208/mail/find-receive-mail?condition=${status}`,
            {   
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    Authorization: 'Bearer ' + window.localStorage.getItem('accessToken'),
                }
            }
        )
            .then(res => res.json())
            .then(data => {
                dispatch(success(data));
                console.log(data);
            })
            .catch(error => dispatch(fail(error)))
    }
}
function fet(url){
    const token = 'eyJkYXRlIjoxNzA3MjY3MTk2NDIxLCJ0eXBlIjoiand0IiwiYWxnIjoiSFMyNTYifQ.eyJlbXBsb3llZU5hbWUiOiLsoJXsp4DshK0iLCJzdWIiOiJyb290IiwiZW1wbG95ZWVFbWFpbCI6IndqZHdsdGpxODQ4MkBnbWFpbC5jb20iLCJleHAiOjE3MDczMDMxOTYsImVtcGxveWVlUm9sZSI6W3siZW1wbG95ZWVObyI6MCwiYXV0aG9yaXR5Q29kZSI6MiwiYXV0aG9yaXR5Ijp7ImF1dGhvcml0eUNvZGUiOjIsImF1dGhvcml0eU5hbWUiOiJST0xFX0FETUlOIiwiYXV0aG9yaXR5RGVzYyI6Iuq0gOumrOyekCJ9fV19.HgsJESI1u7CQo7kHmnGEPJt7cw80-2eNcxdnWewzvhU';
    return fetch(url,
    {   
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: 'Bearer ' + window.localStorage.getItem('accessToken'),
        }
    }
)
}
export const fetchMail = (emailCode) =>{
    console.log("뭐하냐 씨바라");
    return dispatch => {
        fet(`http://localhost:1208/mail/find-a-mail?emailCode=${emailCode}`).then(res => res.json())
            .then(data => {
                if(data.status === 200){
                    dispatch(success(data));
                    console.log(data);
                }
            })
            .catch(error => {
                dispatch(fail(error))
                console.log(error);
            })
    }
}
export const fetchMailByReadStatus = () =>{
    return dispatch => {
        console.log('안읽은 메일 디스패치 중');
        
        dispatch(request());
        fetch(`http://${process.env.REACT_APP_RESTAPI_IP}:1208/mail/non-read-email`,
            {   
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    Authorization: 'Bearer ' + window.localStorage.getItem('accessToken'),
                }
            }
        )
            .then(res => res.json())
            .then(data => {
                dispatch(success(data));
                console.log(data);
            })
            .catch(error => dispatch(fail(error)))
    }
}
export const fetchMailSearch = (word, option) =>{
    return dispatch => {
        console.log('메일 검색 디스패치 중');
        console.log('메일 검색 디스패치 중 :',option,'으로',word,'를 검색합니다.');

        //dispatch(request());

        return fetch(`http://${process.env.REACT_APP_RESTAPI_IP}:1208/mail/find-email?word=${word}&option=${option}`,
            {   
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                    Authorization : 'Bearer ' + window.localStorage.getItem('accessToken'),
                }
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 1100){
                    dispatch(fail());
                } else if(data.status === 401){
                    console.log('또 401 뜸');
                } 
                else {
                    console.log('fetch에서 막 가져온 따끈따끈한 데이터는? : ',data);
                    if(data.data.length === 0){
                        dispatch(fail());
                    } else {
                        dispatch(success(data));
                    }
                }
                
            })
            .catch(error => {
                console.log("fetch 중 오류가 발생했습니다. 기본페이지로 돌아갑니다.",error);
                
                dispatch(fail(error))
            })
    }
}
