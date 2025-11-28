package me.noshow.backend.comment.dto.param;

import me.noshow.backend.bbs.dto.param.PageParam;

public class CommentListParam extends PageParam {

    private Integer bbsSeq; // 게시글 번호

    public CommentListParam(Integer bbsSeq) {
        this.bbsSeq = bbsSeq;
    }

    public Integer getBbsSeq() {
        return bbsSeq;
    }

    public void setBbsSeq(Integer bbsSeq) {
        this.bbsSeq = bbsSeq;
    }
}
