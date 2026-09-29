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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/joql3f3z_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9jsboui9_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/f5zo4a0z_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/qyshqka7_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/pixv3xmm_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/k4qokd4v_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/v4o66a4k_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1qmeqimo_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/z74wlygn_expires_30_days.png"} 
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
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/remyszhf_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[606px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ldw3ub6s_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1 pb-[231px]">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Journal
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ta0acb65_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vto3wjqr_expires_30_days.png"} 
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
									<span className="text-[#4A2C5E] text-[32px] font-bold mr-[139px]" >
										Private Journal
									</span>
									<span className="text-[#2A2A2A] text-sm" >
										A quiet place to unpack thoughts, safely and anonymously.
									</span>
								</div>
								<button className="flex shrink-0 items-center text-left py-[11px] px-6 gap-2 rounded-[999px] border-0" 
									style={{
										background: "linear-gradient(180deg, #4A2C5E, #C45D3E)"
									}}
									onClick={()=>alert("Pressed!")}>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1bekzlqu_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-white text-sm font-bold" >
										New entry
									</span>
								</button>
							</div>
							<div className="flex items-start self-stretch gap-6">
								<div className="flex flex-1 flex-col bg-white p-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
									<div className="flex items-center self-stretch gap-[15px]">
										<span className="text-[#4A2C5E] text-[13px] font-bold" >
											Need a prompt?
										</span>
										<div className="flex flex-1 items-center gap-2">
											<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-1.5 px-3 rounded-[999px] border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-[#4A2C5E] text-xs" >
													How is my body feeling today?
												</span>
											</button>
											<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-1.5 px-3 rounded-[999px] border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-[#4A2C5E] text-xs" >
													One tiny win this week...
												</span>
											</button>
											<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-1.5 px-3 rounded-[999px] border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-[#4A2C5E] text-xs" >
													Placements worries
												</span>
											</button>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch bg-[#F5EDE3] py-5 pr-5 gap-4 rounded-xl">
										<span className="text-[#4A2C5E] text-[22px] font-bold ml-5" >
											Placements &amp; expectations are feeling heavy today
										</span>
										<span className="text-[#2A2A2A] text-base w-[691px] ml-5" >
											Spent the afternoon preparing for the tech round. Felt like my head was spinning. Everyone in the hostel seems to have their prep figured out, and the familial expectations back home are starting to loom large. Writing this down anonymously to clear the air...
										</span>
										<div className="flex justify-between items-start self-stretch pt-3 ml-5">
											<div className="flex shrink-0 items-center gap-2.5">
												<span className="text-[#8A8A8A] text-xs" >
													Mood Check:
												</span>
												<div className="flex shrink-0 items-center gap-1.5">
													<div className="flex flex-col shrink-0 items-start p-1.5 rounded-[999px]">
														<span className="text-black text-lg" >
															😌
														</span>
													</div>
													<div className="flex flex-col shrink-0 items-start p-1.5 rounded-[999px]">
														<span className="text-black text-lg" >
															😊
														</span>
													</div>
													<div className="flex flex-col shrink-0 items-start p-1.5 rounded-[999px]">
														<span className="text-black text-lg" >
															😐
														</span>
													</div>
													<div className="flex flex-col shrink-0 items-start p-1.5 rounded-[999px]">
														<span className="text-black text-lg" >
															😤
														</span>
													</div>
													<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E1A] text-left p-1.5 rounded-[999px] border-0"
														onClick={()=>alert("Pressed!")}>
														<span className="text-black text-lg" >
															😰
														</span>
													</button>
													<div className="flex flex-col shrink-0 items-start p-1.5 rounded-[999px]">
														<span className="text-black text-lg" >
															😢
														</span>
													</div>
												</div>
											</div>
											<span className="text-[#80698A] text-xs" >
												Saved 2 min ago
											</span>
										</div>
									</div>
									<div className="flex justify-between items-center self-stretch">
										<div className="flex shrink-0 items-center gap-1.5">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/r1hq27x0_expires_30_days.png"} 
												className="w-3.5 h-3.5 object-fill"
											/>
											<span className="text-[#5C7A4F] text-xs font-bold" >
												Only you can see this
											</span>
										</div>
										<div className="flex shrink-0 items-center gap-3">
											<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-3 px-5 rounded-[999px] border border-solid border-[#4A2C5E]"
												onClick={()=>alert("Pressed!")}>
												<span className="text-[#4A2C5E] text-sm font-bold" >
													Save draft
												</span>
											</button>
											<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-3 px-5 rounded-[999px] border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-white text-sm font-bold" >
													Publish to private journal
												</span>
											</button>
										</div>
									</div>
								</div>
								<div className="flex flex-col items-start bg-white w-[280px] p-6 gap-4 rounded-[20px] border border-solid border-[#E8E0D8]">
									<span className="text-[#4A2C5E] text-lg font-bold" >
										Reflective prompts
									</span>
									<div className="flex flex-col self-stretch gap-3">
										<input
											placeholder="What's one pressure you can release today?"
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="self-stretch text-[#4A2C5E] bg-[#F5EDE3] text-[13px] p-3 rounded-xl border-0"
										/>
										<div className="flex flex-col self-stretch bg-[#F5EDE3] p-3 rounded-xl">
											<span className="text-[#4A2C5E] text-[13px]" >
												Describe a small boundary you set this week.
											</span>
										</div>
										<input
											placeholder="Who in your college makes you feel safest?"
											value={input2}
											onChange={(event)=>onChangeInput2(event.target.value)}
											className="self-stretch text-[#4A2C5E] bg-[#F5EDE3] text-[13px] p-3 rounded-xl border-0"
										/>
										<div className="flex flex-col self-stretch bg-[#F5EDE3] p-3 rounded-xl">
											<span className="text-[#4A2C5E] text-[13px]" >
												Write about a private hope for the next semester.
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col self-stretch gap-5">
								<div className="flex justify-between items-center self-stretch">
									<span className="text-[#4A2C5E] text-[22px] font-bold" >
										Past Entries
									</span>
									<div className="flex shrink-0 items-center gap-3">
										<div className="flex flex-col shrink-0 items-start py-1.5 pl-3 pr-[82px] rounded-[999px] border border-solid border-[#E8E0D8]">
											<span className="text-[#8A8A8A] text-xs" >
												Search entries...
											</span>
										</div>
										<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-1.5 px-3 rounded-[999px] border border-solid border-[#00000000]"
											onClick={()=>alert("Pressed!")}>
											<span className="text-white text-xs font-bold" >
												All
											</span>
										</button>
										<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-xs font-bold" >
												Drafts
											</span>
										</button>
										<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-xs font-bold" >
												Favourites
											</span>
										</button>
									</div>
								</div>
								<div className="flex flex-col self-stretch gap-3">
									<div className="flex items-center self-stretch bg-white p-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex flex-1 items-center gap-[33px]">
											<span className="text-[#80698A] text-[13px] font-bold" >
												Yesterday
											</span>
											<div className="flex flex-1 flex-col items-start gap-1">
												<span className="text-[#4A2C5E] text-base font-bold" >
													Midnight thoughts on academic expectations
												</span>
												<span className="text-[#2A2A2A] text-[13px]" >
													Sometimes the weight of placements feels like a physical ache. Spoke to a friend today who also feels the same, which helped a tiny bit...
												</span>
											</div>
										</div>
										<div className="flex shrink-0 items-center">
											<span className="text-black text-xl mr-4" >
												😐
											</span>
											<span className="text-[#80698A] text-xs mr-[18px]" >
												240 words
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1uxjz53d_expires_30_days.png"} 
												className="w-4 h-4 object-fill"
											/>
										</div>
									</div>
									<div className="flex items-center self-stretch bg-white p-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex flex-1 items-center gap-[55px]">
											<span className="text-[#80698A] text-[13px] font-bold" >
												24 Sep
											</span>
											<div className="flex flex-1 flex-col items-start gap-1">
												<span className="text-[#4A2C5E] text-base font-bold" >
													A healthy boundary with parents
												</span>
												<span className="text-[#2A2A2A] text-[13px]" >
													Phoned home today and managed to communicate that I need quiet hours during my test preparations. It wasn&#39;t as hard as I expected...
												</span>
											</div>
										</div>
										<div className="flex shrink-0 items-center">
											<span className="text-black text-xl mr-4" >
												😌
											</span>
											<span className="text-[#80698A] text-xs mr-[18px]" >
												185 words
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/rfsqnenh_expires_30_days.png"} 
												className="w-4 h-4 object-fill"
											/>
										</div>
									</div>
									<div className="flex items-center self-stretch bg-white p-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex flex-1 items-center gap-[57px]">
											<span className="text-[#80698A] text-[13px] font-bold" >
												18 Sep
											</span>
											<div className="flex flex-1 flex-col items-start gap-1">
												<span className="text-[#4A2C5E] text-base font-bold" >
													Exam pressure and hostellers&#39; support
												</span>
												<span className="text-[#2A2A2A] text-[13px]" >
													We gathered in room 304 and ordered chai. No talk about CAT or final years, just listening to indie music. Exactly the sanity check I needed.
												</span>
											</div>
										</div>
										<div className="flex shrink-0 items-center">
											<span className="text-black text-xl mr-4" >
												😊
											</span>
											<span className="text-[#80698A] text-xs mr-[19px]" >
												310 words
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lly8mzou_expires_30_days.png"} 
												className="w-4 h-4 object-fill"
											/>
										</div>
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