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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/anfvwco8_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/udcjj03q_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/0xux0ie5_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/r22csnjq_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/tm2khd4c_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/7f5ysaub_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/zyk5pso5_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/wnxgecls_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/nxnf1980_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Settings
								</span>
							</div>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-[15px]">
							<div className="self-stretch bg-[#E8E0D8] h-[1px]">
							</div>
							<div className="flex items-center self-stretch bg-[#7B9E6B14] py-3 rounded-xl">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vcm0saby_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[430px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/xa7ha79u_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1 pb-[306px]">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								MindCircle Sanctuary
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/km6xnj65_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search sanctuary...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/88s3ehqx_expires_30_days.png"} 
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
							<div className="flex items-center self-stretch gap-6">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/m0avixpq_expires_30_days.png"} 
									className="w-[72px] h-[72px] rounded-[36px] object-fill"
								/>
								<div className="flex flex-col shrink-0 items-start gap-1.5">
									<span className="text-[#4A2C5E] text-[28px] font-bold mr-[89px]" >
										Priya Kumar
									</span>
									<span className="text-[#2A2A2A] text-sm" >
										3rd Year B.Tech • PES University, Bengaluru
									</span>
								</div>
							</div>
							<div className="flex items-center self-stretch gap-6">
								<div className="flex flex-col shrink-0 items-center pb-3">
									<span className="text-[#4A2C5E] text-[15px] font-bold" >
										About
									</span>
								</div>
								<div className="flex flex-col shrink-0 items-center pb-3">
									<span className="text-[#2A2A2A] text-[15px]" >
										Journal Logs
									</span>
								</div>
								<div className="flex flex-col shrink-0 items-center pb-3">
									<span className="text-[#2A2A2A] text-[15px]" >
										Saved Stories
									</span>
								</div>
								<div className="flex flex-col shrink-0 items-center pb-3">
									<span className="text-[#2A2A2A] text-[15px]" >
										Achievements
									</span>
								</div>
							</div>
							<div className="flex items-start self-stretch gap-10">
								<div className="flex flex-1 flex-col items-start gap-6">
									<span className="text-[#4A2C5E] text-xl font-bold" >
										Sanctuary Settings
									</span>
									<div className="flex items-center self-stretch gap-4">
										<div className="flex flex-col items-start w-[292px] gap-2">
											<span className="text-[#4A2C5E] text-[13px] font-bold" >
												Sanctuary Nickname (Editable)
											</span>
											<input
												placeholder="Priya Kumar"
												value={input1}
												onChange={(event)=>onChangeInput1(event.target.value)}
												className="self-stretch text-[#2A2A2A] bg-[#F5EDE3] text-sm p-3.5 rounded-xl border-0"
											/>
										</div>
										<div className="flex flex-col items-start w-[292px] gap-2">
											<span className="text-[#4A2C5E] text-[13px] font-bold" >
												College or Institution
											</span>
											<input
												placeholder="PES University, Bengaluru"
												value={input2}
												onChange={(event)=>onChangeInput2(event.target.value)}
												className="self-stretch text-[#2A2A2A] bg-[#F5EDE3] text-sm p-3.5 rounded-xl border-0"
											/>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#4A2C5E] text-[13px] font-bold" >
											Your Safe Peer Alias
										</span>
										<div className="flex justify-between items-center self-stretch bg-[#F5EDE3] p-3.5 rounded-xl">
											<span className="text-[#4A2C5E] text-sm font-bold" >
												quiet-sparrow-42
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5te1z3gs_expires_30_days.png"} 
												className="w-4 h-4 rounded-xl object-fill"
											/>
										</div>
										<span className="text-[#8A8A8A] text-xs" >
											This alias is auto-generated and shown on Peer Circles. Your real name is never tied to comments.
										</span>
									</div>
									<div className="flex flex-col items-start self-stretch gap-3">
										<span className="text-[#4A2C5E] text-[13px] font-bold" >
											Your Support Focus Areas
										</span>
										<div className="flex flex-col items-start self-stretch gap-2">
											<div className="flex items-center gap-2">
												<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E0D] text-left py-2 px-4 rounded-[999px] border border-solid border-[#4A2C5E]"
													onClick={()=>alert("Pressed!")}>
													<span className="text-[#4A2C5E] text-[13px] font-bold" >
														Journaling
													</span>
												</button>
												<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E0D] text-left py-2 px-4 rounded-[999px] border border-solid border-[#4A2C5E]"
													onClick={()=>alert("Pressed!")}>
													<span className="text-[#4A2C5E] text-[13px] font-bold" >
														Peer support
													</span>
												</button>
												<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#E8E0D8]"
													onClick={()=>alert("Pressed!")}>
													<span className="text-[#2A2A2A] text-[13px] font-bold" >
														Professional Counselling
													</span>
												</button>
											</div>
											<div className="flex items-center gap-2">
												<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#E8E0D8]"
													onClick={()=>alert("Pressed!")}>
													<span className="text-[#2A2A2A] text-[13px] font-bold" >
														Activities &amp; Breathwork
													</span>
												</button>
												<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#E8E0D8]"
													onClick={()=>alert("Pressed!")}>
													<span className="text-[#2A2A2A] text-[13px] font-bold" >
														Mood Tracking
													</span>
												</button>
											</div>
										</div>
									</div>
									<span className="text-[#80698A] text-xs" >
										Student account verified • Member since Sep 2024
									</span>
								</div>
								<div className="flex flex-1 flex-col gap-5">
									<div className="flex flex-col items-start self-stretch relative">
										<div className="flex flex-col items-start self-stretch gap-6">
											<div className="flex flex-col items-start gap-1">
												<span className="text-[#4A2C5E] text-xl font-bold mr-[227px]" >
													Milestones Earned
												</span>
												<span className="text-[#8A8A8A] text-[13px]" >
													Your milestones of quiet courage &amp; reflection. Always private to you.
												</span>
											</div>
											<div className="flex items-start self-stretch pt-4 pb-[52px]">
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/agq7b6dr_expires_30_days.png"} 
													className="w-8 h-8 ml-4 rounded-2xl object-fill"
												/>
												<div className="flex-1 self-stretch">
												</div>
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vbeqz836_expires_30_days.png"} 
													className="w-8 h-8 rounded-2xl object-fill"
												/>
												<div className="flex-1 self-stretch">
												</div>
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lyoq0b7d_expires_30_days.png"} 
													className="w-8 h-8 rounded-2xl object-fill"
												/>
												<div className="flex-1 self-stretch">
												</div>
											</div>
										</div>
										<span className="text-[#5C7A4F] text-[13px] font-bold text-center w-[31px] absolute bottom-[-8px] left-4" >
											First Check-in
										</span>
										<span className="text-[#5C7A4F] text-[13px] font-bold text-center w-[25px] absolute bottom-[-24px] left-[183px]" >
											7-Day Streak
										</span>
										<span className="text-[#2A2A2A] text-[13px] font-bold text-center w-[29px] absolute bottom-[-8px] right-[105px]" >
											10 Journals
										</span>
									</div>
									<div className="flex flex-col items-end self-stretch">
										<span className="text-[#80698A] text-[10px] text-center w-[27px] mr-[106px]" >
											Locked (3 left)
										</span>
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