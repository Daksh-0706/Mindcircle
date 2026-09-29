import React, {useState} from "react";
export default (props) => {
	const [input1, onChangeInput1] = useState('');
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-col items-start bg-[#FFF8F0CC] w-60 pt-6 px-6">
						<div className="flex items-center mb-7 gap-2">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/d86pab49_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/44n2rhei_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/81d4s28m_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/k79a68z8_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/8idibzav_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9lif24yj_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vur5ifz8_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ypdd5orv_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/270y99i3_expires_30_days.png"} 
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
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jj2ay80c_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[476px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jvuyvntd_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Dashboard
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/bojfqki5_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lzgxfulz_expires_30_days.png"} 
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
						<div className="flex flex-col self-stretch p-10 gap-6">
							<div className="flex flex-col items-start self-stretch relative p-9 rounded-2xl" 
								style={{
									background: "linear-gradient(180deg, #4A2C5E, #C45D3E)"
								}}>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/x8qvv8r3_expires_30_days.png"} 
									className="flex-1 w-[180px] absolute top-0 bottom-0 left-0 rounded-2xl object-fill"
								/>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/yldtmczn_expires_30_days.png"} 
									className="w-[200px] h-40 absolute bottom-0 right-10 rounded-2xl object-fill"
								/>
								<div className="flex flex-col self-stretch gap-[15px]">
									<div className="flex flex-col items-start self-stretch gap-1">
										<span className="text-[#FFF8F0] text-[13px] font-bold" >
											Friday, 26 September
										</span>
										<span className="text-[#FFF8F0] text-[28px] font-bold" >
											Good morning, Priya.
										</span>
									</div>
									<div className="flex justify-between items-center self-stretch">
										<span className="text-[#FFF8F0] text-sm" >
											Take a minute to center your head space.
										</span>
										<button className="flex flex-col shrink-0 items-start bg-white text-left py-2.5 px-5 rounded-[999px] border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-[13px] font-bold" >
												Check in now
											</span>
										</button>
									</div>
								</div>
							</div>
							<div className="flex items-start self-stretch gap-6">
								<div className="flex flex-1 flex-col items-start bg-[#FFFFFFBF] py-7 pr-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]" 
									style={{
										boxShadow: "0px 4px 16px #4A2C5E08"
									}}>
									<span className="text-[#4A2C5E] text-xl font-bold ml-7" >
										How are you feeling?
									</span>
									<div className="flex justify-between items-center self-stretch ml-7">
										<div className="flex flex-col shrink-0 items-center gap-1.5">
											<span className="text-black text-[22px]" >
												😊
											</span>
											<span className="text-[#8A8A8A] text-[11px]" >
												Happy
											</span>
										</div>
										<div className="flex flex-col items-start w-12 gap-1.5">
											<button className="flex flex-col items-start bg-[#4A2C5E1A] text-left py-[5px] px-[7px] rounded-[99px] border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-black text-[22px]" >
													😌
												</span>
											</button>
											<span className="text-[#4A2C5E] text-[11px] font-bold" >
												Peaceful
											</span>
										</div>
										<div className="flex flex-col shrink-0 items-center gap-1.5">
											<span className="text-black text-[22px]" >
												😐
											</span>
											<span className="text-[#8A8A8A] text-[11px]" >
												Neutral
											</span>
										</div>
										<div className="flex flex-col shrink-0 items-center gap-1.5">
											<span className="text-black text-[22px]" >
												😤
											</span>
											<span className="text-[#8A8A8A] text-[11px]" >
												Frustrated
											</span>
										</div>
										<div className="flex flex-col shrink-0 items-center gap-1.5">
											<span className="text-black text-[22px]" >
												😰
											</span>
											<span className="text-[#8A8A8A] text-[11px]" >
												Anxious
											</span>
										</div>
										<div className="flex flex-col shrink-0 items-center gap-1.5">
											<span className="text-black text-[22px]" >
												😢
											</span>
											<span className="text-[#8A8A8A] text-[11px]" >
												Sad
											</span>
										</div>
									</div>
									<input
										placeholder="Add a private note about what's going on..."
										value={input1}
										onChange={(event)=>onChangeInput1(event.target.value)}
										className="self-stretch text-[#8A8A8A] bg-transparent text-[13px] py-3 px-4 ml-7 rounded-xl border border-solid border-[#E8E0D8]"
									/>
									<button className="flex flex-col items-center self-stretch bg-[#4A2C5E] text-left py-3 ml-7 rounded-[999px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-sm font-bold" >
											Save Check-in
										</span>
									</button>
								</div>
								<div className="flex-1 bg-[#FFFFFFBF] p-7 rounded-[20px] border border-solid border-[#E8E0D8]">
									<div className="flex justify-between items-center self-stretch mb-5">
										<div className="flex flex-col shrink-0 items-start gap-1">
											<span className="text-[#8A8A8A] text-xs font-bold mr-[98px]" >
												This Week
											</span>
											<span className="text-[#2A2A2A] text-sm" >
												Total completed actions
											</span>
										</div>
										<div className="flex shrink-0 items-start gap-2">
											<span className="text-[#4A2C5E] text-5xl font-bold" >
												4
											</span>
											<span className="text-[#8A8A8A] text-sm font-bold mt-[33px]" >
												check-ins
											</span>
										</div>
									</div>
									<div className="self-stretch bg-[#E8E0D8] h-[1px] mb-[19px]">
									</div>
									<div className="self-stretch">
										<div className="flex justify-between items-center self-stretch mb-3">
											<span className="text-[#2A2A2A] text-sm" >
												3 journal days completed
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/yrkfu60d_expires_30_days.png"} 
												className="w-4 h-4 object-fill"
											/>
										</div>
										<div className="self-stretch bg-[#E8E0D8] h-[1px] mb-[11px]">
										</div>
										<div className="flex justify-between items-center self-stretch mb-3">
											<span className="text-[#2A2A2A] text-sm" >
												5 day streak
											</span>
											<span className="text-black text-sm" >
												🔥
											</span>
										</div>
										<div className="self-stretch bg-[#E8E0D8] h-[1px] mb-[11px]">
										</div>
										<div className="flex justify-between items-center self-stretch py-1">
											<span className="text-[#C45D3E] text-sm font-bold" >
												View insights
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/qlnzlzz6_expires_30_days.png"} 
												className="w-4 h-4 object-fill"
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-start self-stretch gap-6">
								<div className="flex flex-1 flex-col items-start bg-[#FFFFFFBF] py-7 pr-7 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
									<span className="text-[#4A2C5E] text-xl font-bold ml-7" >
										Try something that helps
									</span>
									<div className="flex flex-col self-stretch ml-7 gap-3">
										<div className="flex items-center self-stretch bg-[#7B9E6B14] p-3 gap-4 rounded-xl">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ump4jbds_expires_30_days.png"} 
												className="w-10 h-10 rounded-lg object-fill"
											/>
											<div className="flex flex-1 flex-col items-start gap-0.5">
												<span className="text-[#2A2A2A] text-sm font-bold" >
													Box breathing exercise
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													Duration: 4 mins • Anxiety release
												</span>
											</div>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/z86zq672_expires_30_days.png"} 
												className="w-4 h-4 rounded-xl object-fill"
											/>
										</div>
										<div className="flex items-center self-stretch bg-[#4A2C5E1A] p-3 gap-4 rounded-xl">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vvr4yvgg_expires_30_days.png"} 
												className="w-10 h-10 rounded-lg object-fill"
											/>
											<div className="flex flex-1 flex-col items-start gap-0.5">
												<span className="text-[#2A2A2A] text-sm font-bold" >
													Write placement worries
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													Duration: 10 mins • Grounding therapy
												</span>
											</div>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5pzcvkox_expires_30_days.png"} 
												className="w-4 h-4 rounded-xl object-fill"
											/>
										</div>
										<div className="flex items-center self-stretch bg-[#C45D3E1A] p-3 gap-4 rounded-xl">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/tpscbc0r_expires_30_days.png"} 
												className="w-10 h-10 rounded-lg object-fill"
											/>
											<div className="flex flex-1 flex-col items-start gap-0.5">
												<span className="text-[#2A2A2A] text-sm font-bold" >
													Anxiety release audio
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													Duration: 6 mins • Calm guidance
												</span>
											</div>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/cxf1bi3b_expires_30_days.png"} 
												className="w-4 h-4 rounded-xl object-fill"
											/>
										</div>
									</div>
								</div>
								<div className="flex flex-1 flex-col items-start bg-[#4A2C5E] py-7 gap-5 rounded-[20px]">
									<span className="text-[#FFF8F0] text-xl font-bold ml-7" >
										Private by design
									</span>
									<span className="text-[#FFF8F0] text-sm w-[444px] ml-7" >
										Your identity stays entirely yours. Your university is verified through a closed secure process, but no reports ever track back to you.
									</span>
									<div className="flex items-center py-2 ml-7 gap-[7px]">
										<span className="text-[#FFF8F0] text-sm font-bold" >
											Privacy settings
										</span>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/a7urnnoo_expires_30_days.png"} 
											className="w-4 h-4 object-fill"
										/>
									</div>
								</div>
							</div>
							<div className="flex justify-between items-center self-stretch bg-[#FFFFFFBF] py-5 px-7 rounded-2xl border border-solid border-[#E8E0D8]">
								<div className="flex flex-col shrink-0 items-start gap-1">
									<span className="text-[#4A2C5E] text-base font-bold" >
										Continue your reflection
									</span>
									<span className="text-[#8A8A8A] text-[13px] mr-[69px]" >
										Last entry 2 days ago
									</span>
								</div>
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-5 rounded-[999px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#4A2C5E] text-[13px] font-bold" >
										Open journal
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}