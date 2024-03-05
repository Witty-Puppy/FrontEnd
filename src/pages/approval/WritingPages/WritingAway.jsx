import React, { useEffect, useRef, useState } from 'react';
import './WritingAway.css';
import CurrentTime from '../Time';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { callLoggedinUserAPI } from '../../../apis/ApprovalAPICalls';

function WritingAway(){
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentTimeString = CurrentTime();
    const [clikType, setClickType] = useState("");
    const [image, SetImage] = useState(null);
    const imangeInput = useRef();

    function getDaysDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const difference = end - start; // 밀리초 단위의 차이
        const days = difference / (1000 * 60 * 60 * 24); // 일수로 변환
        return Math.round(days); // 소수점 아래를 반올림하여 반환
      }

    const [form, setForm] = useState({
        OLTitle: '',
        OLStart: '',
        OLEnd: '',
        OLReason: '',
        file: '',
    });

        // 로그인한 정보 불러옴
        useEffect(() => {
            dispatch(callLoggedinUserAPI());
          }, [dispatch]);

    return(
        <>
            <div className="writing_button_and_content">
                <div className="writing_section">
                    <div className="aproval_save_button">
                        <span className="saving_text">임시 저장</span>
                    </div>
                    <div className="approval_submit_button">
                        <span className="submitting_text">결재 상신</span>
                    </div>
            </div>
            <section className="form_writing_section">
        <div className="form_body">
            <div className="form_title_section">
                <div className="form_title">외근 신청서</div>
            </div>
            <div className="form_table" style={{ display: 'table' }}>
                <div style={{ display: 'table-row' }}>
                    <div className ="A" style={{ display: 'table-cell' }}>제목</div>
                    <div className ="B" style={{ display: 'table-cell' }}>
                        <input className="input_box" type="text"/>
                    </div>
                </div>

                <div style={{ display: 'table-row' }}>
                    <div className ="A" style={{ display: 'table-cell' }}>신청 날짜</div>
                    <div className ="B" style={{ display: 'table-cell' }}>
                        <input type="date" id="start_date"  class="inputbox"/>
                        <span className="datelength">~</span>
                        <input type="date" id="end_date"  class="inputbox"/>
                        <span className="dateTotal">, 총</span>
                        <input className="total_day" type="text"/>
                        <span className="date_unit">일</span>
                    </div>
                </div>

                <div style={{ display: 'table-row' }}>
                    <div className ="A" style={{ display: 'table-cell' }}>장소</div>
                    <div className ="B" style={{ display: 'table-cell' }}>
                        <input class="input_box" type="text"/>
                    </div>
                </div>

                <div style={{ display: 'table-row' }}>
                    <div className ="A" style={{ display: 'table-cell' }}>신청 사유</div>
                    <div className ="B" style={{ display: 'table-cell' }}>
                        <input className="input_box" type="text"/>
                    </div>
                </div>
            </div>
        </div>
            </section>
        </div>
        </>
    );
}

export default WritingAway;