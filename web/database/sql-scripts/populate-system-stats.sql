CREATE procedure populate (in num int)
begin
	declare i int default 0;
	while i < num do
	INSERT into system_stats (job_id, cpu, mem) values (1, 2, 76);
	set i = i + 1;
	end while
end //
delimiter ;

call populate (10)
