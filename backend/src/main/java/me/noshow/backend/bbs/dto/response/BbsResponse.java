package me.noshow.backend.bbs.dto.response;

import me.noshow.backend.bbs.domain.Bbs;

public class BbsResponse {

    private Bbs bbs;

    public BbsResponse(Bbs bbs) {
        this.bbs = bbs;
    }

    public Bbs getBbs() {
        return bbs;
    }

    public void setBbs(Bbs bbs) {
        this.bbs = bbs;
    }
}
