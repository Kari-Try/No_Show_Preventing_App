package me.noshow.backend.comment.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.RestController;

import me.noshow.backend.comment.domain.Comment;
import me.noshow.backend.comment.dto.param.CommentListParam;
import me.noshow.backend.comment.dto.param.CreateCommentParam;
import me.noshow.backend.comment.dto.param.UpdateCommentParam;

@Profile("db")
@Mapper
@Repository
public interface CommentDao {

    List<Comment> getCommentPageList(CommentListParam param);
    Integer getCommentCount(Integer seq);

    void createComment(CreateCommentParam param);
    Integer deleteComment(Integer seq);

    Comment getCommentBySeq(Integer seq);
    Integer updateComment(UpdateCommentParam param);
}
