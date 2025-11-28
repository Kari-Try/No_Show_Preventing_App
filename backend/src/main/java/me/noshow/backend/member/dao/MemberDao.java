package me.noshow.backend.member.dao;

import org.springframework.context.annotation.Profile;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import me.noshow.backend.member.domain.Member;
import me.noshow.backend.member.dto.param.CreateMemberParam;

@Profile("db")
@Mapper
@Repository
public interface MemberDao {

	Member findById(String id);

	Integer isExistUserId(String id);

	Integer createMember(CreateMemberParam param);
}
