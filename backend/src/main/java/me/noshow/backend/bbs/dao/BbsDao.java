package me.noshow.backend.bbs.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import me.noshow.backend.bbs.domain.Bbs;
import me.noshow.backend.bbs.dto.param.BbsCountParam;
import me.noshow.backend.bbs.dto.param.BbsListParam;
import me.noshow.backend.bbs.dto.param.CreateBbsAnswerParam;
import me.noshow.backend.bbs.dto.param.CreateBbsParam;
import me.noshow.backend.bbs.dto.param.CreateReadCountParam;
import me.noshow.backend.bbs.dto.param.UpdateBbsParam;

import org.springframework.context.annotation.Profile;
import org.apache.ibatis.annotations.Mapper;

@Profile("db")
@Mapper
@Repository
public interface BbsDao {

	List<Bbs> getBbsSearchPageList(BbsListParam param);
	Integer getBbsCount(BbsCountParam param);

	Bbs getBbs(Integer seq);
	Integer createBbsReadCountHistory(CreateReadCountParam param);
	Integer increaseBbsReadCount(Integer seq);

	void createBbs(CreateBbsParam param);

	Integer updateBbsStep(Integer parentSeq);
	Integer getBbsAnswerCount(Integer parentSeq);
	void createBbsAnswer(CreateBbsAnswerParam param);

	Integer updateBbs(UpdateBbsParam param);

	Integer deleteBbs(Integer seq);
}
