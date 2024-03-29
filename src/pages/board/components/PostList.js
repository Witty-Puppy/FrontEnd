import { useEffect, useState } from 'react';
import styles from './PostList.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PostList = ({data}) => {


    console.log('postList 컴포넌트에서 받은 postList props : ', data);

    const navigate = useNavigate();

    useEffect(() => {
        console.log(data);

    }, [data]);


    return <>
         <table className={styles.PostList}>
            <thead>
                <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>조회</th>
                    <th>좋아요</th>
                </tr>
            </thead>

            <tbody>

             {data?.content?.map((post, idx) => (

                    <tr key={post.postCode} onClick={() => navigate(`/board/posts/${post.postCode}`)}
                        className=''
                    >
                        <td>{post.postCode}</td>
                        <td>{post.postTitle}</td>
                        <td>{post.employee.employeeName}</td>
                        <td>{`${post.postDate[0]}.${post.postDate[1]}.${post.postDate[2]}`}</td>
                        <td>{post.postViews}</td>
                        <td>{post.postLikeList.length}</td>
                    </tr>

                ))

                
            }


            </tbody>
        </table>

    
    </>
}

export default PostList;