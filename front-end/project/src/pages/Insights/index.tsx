import React, {useState} from "react";
export default (props) => {
	const [input1, onChangeInput1] = useState('');
	const [input2, onChangeInput2] = useState('');
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-col items-start bg-[#FFF8F0CC] w-60 pt-6 px-6">
						<div className="flex items-center mb-7 gap-2">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/nwq3iout_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/d14lp4uq_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/l49veihk_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/mbyeaety_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/58mh40yt_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jrvsxsxo_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/e0amtht8_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/4ey94iw2_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/gwt4sf2p_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Settings
								</span>
							</div>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-[15px]">
							<div className="self-stretch bg-[#E8E0D8] h-[1px]">
							</div>
							<div className="flex items-center self-stretch bg-[#7B9E6B14] py-3 rounded-xl">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/h3p0n0td_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[774px]">
							<div className="flex shrink-0 items-center mt-3 gap-2.5">
								<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-2.5 px-2 rounded-[19px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-white text-sm font-bold" >
										PK
									</span>
								</button>
								<div className="flex flex-col shrink-0 items-start gap-0.5">
									<span className="text-[#2A2A2A] text-[13px] font-bold" >
										Priya Kumar
									</span>
									<span className="text-[#8A8A8A] text-[11px] mr-[37px]" >
										Student
									</span>
								</div>
							</div>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1bqkxls3_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Insights
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/0o3bitzs_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/47sllx57_expires_30_days.png"} 
									className="w-8 h-8 object-fill"
								/>
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[9px] px-[7px] rounded-2xl border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#4A2C5E] text-[11px] font-bold" >
										PK
									</span>
								</button>
							</div>
						</div>
						<div className="flex flex-col self-stretch p-10 gap-8">
							<div className="flex justify-between items-center self-stretch">
								<div className="flex flex-col shrink-0 items-start gap-1">
									<span className="text-[#4A2C5E] text-[32px] font-bold mr-[163px]" >
										Wellbeing Insights
									</span>
									<span className="text-[#2A2A2A] text-sm" >
										Non-diagnostic patterns and trends from your head space reflections.
									</span>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-2 px-4 rounded-[999px] border border-solid border-[#00000000]"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-[13px] font-bold" >
											7 Days
										</span>
									</button>
									<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#E8E0D8]"
										onClick={()=>alert("Pressed!")}>
										<span className="text-[#4A2C5E] text-[13px] font-bold" >
											30 Days
										</span>
									</button>
									<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#E8E0D8]"
										onClick={()=>alert("Pressed!")}>
										<span className="text-[#4A2C5E] text-[13px] font-bold" >
											3 Months
										</span>
									</button>
								</div>
							</div>
							<div className="flex flex-col items-start self-stretch bg-white py-7 pr-7 rounded-[20px] border border-solid border-[#E8E0D8]">
								<div className="flex justify-between items-center self-stretch mb-5 ml-7">
									<span className="text-[#4A2C5E] text-lg font-bold" >
										Your head space timeline (Last 14 Days)
									</span>
									<div className="flex shrink-0 items-center gap-1.5">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/t7f3163w_expires_30_days.png"} 
											className="w-2 h-2 object-fill"
										/>
										<span className="text-[#8A8A8A] text-xs" >
											Mood level
										</span>
									</div>
								</div>
								<div className="self-stretch mb-5 ml-7">
									<div className="flex flex-col items-start self-stretch my-2 mr-10">
										<div className="flex flex-col items-end self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[139px] mr-[78px]">
												<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[170px]">
												<div className="bg-[#4A2C5E] w-[79px] h-0.5">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[106px] mr-[314px]">
												<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[106px] mr-[235px]">
												<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[106px] mr-[157px]">
												<div className="bg-[#4A2C5E] w-[78px] h-[33px]">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pt-[1px] ml-[394px]">
											<div className="bg-[#4A2C5E] w-[78px] h-[31px] mb-[74px]">
											</div>
										</div>
										<div className="flex flex-col items-center self-stretch">
											<div className="flex flex-col items-center bg-[#4A2C5E] pb-[75px]">
												<div className="bg-[#4A2C5E] w-[77px] h-[31px]">
												</div>
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pt-[1px] ml-[551px]">
											<div className="bg-[#4A2C5E] w-[78px] h-[31px] mb-[74px]">
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] py-1 ml-[158px]">
											<div className="bg-[#4A2C5E] w-[77px] h-[65px]">
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pb-[41px] ml-[236px]">
											<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pb-[41px] ml-[315px]">
											<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pb-2">
											<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
											</div>
										</div>
										<div className="flex flex-col items-center bg-[#4A2C5E] pb-2 ml-[79px]">
											<div className="bg-[#4A2C5E] w-[79px] h-[33px]">
											</div>
										</div>
									</div>
									<div className="flex justify-between items-center self-stretch">
										<span className="text-[#80698A] text-[11px]" >
											Day 1
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 3
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 5
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 7
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 9
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 11
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Day 13
										</span>
										<span className="text-[#80698A] text-[11px]" >
											Today
										</span>
									</div>
								</div>
								<div className="self-stretch bg-[#E8E0D8] h-[1px] mb-[19px] ml-7">
								</div>
								<span className="text-[#2A2A2A] text-sm ml-7" >
									Takeaway: Your mood has been steadily improving this week as placement anxiety begins to ease up with peers.
								</span>
							</div>
							<div className="flex items-start self-stretch gap-6">
								<div className="flex flex-1 flex-col items-start bg-white py-7 pr-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
									<span className="text-[#4A2C5E] text-lg font-bold ml-7" >
										Mood distribution
									</span>
									<div className="flex flex-col self-stretch ml-7 gap-3.5">
										<div className="flex items-center self-stretch">
											<span className="text-[#2A2A2A] text-[13px] font-bold mr-11" >
												Peaceful
											</span>
											<div className="flex-1 items-start bg-[#F5EDE3] mr-[17px] rounded">
												<div className="bg-[#4A2C5E] w-[125px] h-2">
												</div>
											</div>
											<span className="text-[#80698A] text-[13px]" >
												5 days
											</span>
										</div>
										<div className="flex items-center self-stretch">
											<span className="text-[#2A2A2A] text-[13px] font-bold mr-[47px]" >
												Anxious
											</span>
											<div className="flex-1 items-start bg-[#F5EDE3] mr-[17px] rounded">
												<div className="bg-[#C45D3E] w-[75px] h-2">
												</div>
											</div>
											<span className="text-[#80698A] text-[13px]" >
												3 days
											</span>
										</div>
										<div className="flex items-center self-stretch">
											<span className="text-[#2A2A2A] text-[13px] font-bold mr-8" >
												Frustrated
											</span>
											<div className="flex-1 items-start bg-[#F5EDE3] mr-5 rounded">
												<div className="bg-[#6B4A80] w-[25px] h-2">
												</div>
											</div>
											<span className="text-[#80698A] text-[13px]" >
												1 days
											</span>
										</div>
										<div className="flex items-center self-stretch">
											<span className="text-[#2A2A2A] text-[13px] font-bold" >
												Sad
											</span>
											<div className="flex-1 self-stretch">
											</div>
											<div className="shrink-0 items-start bg-[#F5EDE3] pr-[315px] mr-5 rounded">
												<div className="bg-[#8A8A8A] w-[25px] h-2">
												</div>
											</div>
											<span className="text-[#80698A] text-[13px]" >
												1 days
											</span>
										</div>
									</div>
								</div>
								<div className="flex flex-1 flex-col items-start bg-white py-7 pr-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
									<span className="text-[#4A2C5E] text-lg font-bold ml-7" >
										Your reflection metrics
									</span>
									<div className="flex flex-col self-stretch ml-7 gap-3">
										<div className="flex flex-col self-stretch gap-3">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-sm" >
													Average Mood
												</span>
												<span className="text-[#4A2C5E] text-sm font-bold" >
													Peaceful 😌
												</span>
											</div>
											<div className="self-stretch bg-[#E8E0D8] h-[1px]">
											</div>
										</div>
										<div className="flex flex-col self-stretch gap-3">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-sm" >
													Best Day
												</span>
												<span className="text-[#4A2C5E] text-sm font-bold" >
													Thursday (chai circle)
												</span>
											</div>
											<div className="self-stretch bg-[#E8E0D8] h-[1px]">
											</div>
										</div>
										<div className="flex flex-col self-stretch gap-3">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-sm" >
													Check-in Streak
												</span>
												<span className="text-[#4A2C5E] text-sm font-bold" >
													5 Days 🔥
												</span>
											</div>
											<div className="self-stretch bg-[#E8E0D8] h-[1px]">
											</div>
										</div>
										<div className="flex justify-between items-center self-stretch">
											<span className="text-[#2A2A2A] text-sm" >
												Journal Entries Completed
											</span>
											<span className="text-[#4A2C5E] text-sm font-bold" >
												3 entries
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-start self-stretch bg-white py-7 pr-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
								<span className="text-[#4A2C5E] text-lg font-bold ml-7" >
									Patterns we noticed
								</span>
								<div className="flex flex-col self-stretch ml-7 gap-4">
									<div className="flex justify-between items-center self-stretch">
										<div className="flex shrink-0 items-center gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9mvgd0bz_expires_30_days.png"} 
												className="w-2 h-2 object-fill"
											/>
											<span className="text-[#2A2A2A] text-sm" >
												Your mood improved after joining peer chat circles
											</span>
										</div>
										<span className="text-[#4A2C5E] text-sm font-bold" >
											3x
										</span>
									</div>
									<div className="flex justify-between items-center self-stretch">
										<div className="flex shrink-0 items-center gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/o0okaxxp_expires_30_days.png"} 
												className="w-2 h-2 object-fill"
											/>
											<span className="text-[#2A2A2A] text-sm" >
												Evening journaling sessions were longer and more descriptive
											</span>
										</div>
										<span className="text-[#4A2C5E] text-sm font-bold" >
											10m
										</span>
									</div>
									<div className="flex justify-between items-center self-stretch">
										<div className="flex shrink-0 items-center gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/gtjf96om_expires_30_days.png"} 
												className="w-2 h-2 object-fill"
											/>
											<span className="text-[#2A2A2A] text-sm" >
												Frustration spiked during mid-day placement announcements
											</span>
										</div>
										<span className="text-[#4A2C5E] text-sm font-bold" >
											2 days
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-start self-stretch bg-[#F5EDE3] py-7 pr-7 gap-5 rounded-[20px]">
								<span className="text-[#4A2C5E] text-xl font-bold ml-7" >
									Weekly Pause &amp; Process
								</span>
								<div className="flex flex-col self-stretch ml-7 gap-4">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-sm font-bold" >
											1. What did you learn about your coping limits this week?
										</span>
										<input
											placeholder="Write your private response..."
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="self-stretch text-[#8A8A8A] bg-white text-[13px] p-3 rounded-lg border border-solid border-[#E8E0D8]"
										/>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-sm font-bold" >
											2. Name one thing you&#39;re looking forward to next week.
										</span>
										<input
											placeholder="Write your private response..."
											value={input2}
											onChange={(event)=>onChangeInput2(event.target.value)}
											className="self-stretch text-[#8A8A8A] bg-white text-[13px] p-3 rounded-lg border border-solid border-[#E8E0D8]"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}