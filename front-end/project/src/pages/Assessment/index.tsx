import React, {useState} from "react";
export default (props) => {
	const [input1, onChangeInput1] = useState('');
	const [input2, onChangeInput2] = useState('');
	const [input3, onChangeInput3] = useState('');
	const [input4, onChangeInput4] = useState('');
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-col items-start bg-[#FFF8F0CC] w-60 pt-6 px-6">
						<div className="flex items-center mb-7 gap-2">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ndatnrzo_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9zo40msi_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/fj5imkzh_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/y6aszwoc_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/snedffc1_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/55or436e_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5emaaynp_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ob4prgj6_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/6xml91i5_expires_30_days.png"} 
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
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vjq892d9_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[666px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jwxs7ui7_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Wellness Check
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/vjfb491k_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/i7w850ep_expires_30_days.png"} 
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
						<div className="flex flex-col items-center self-stretch py-10 gap-10">
							<div className="flex flex-col w-[640px] gap-3">
								<div className="flex justify-between items-center self-stretch">
									<span className="text-[#4A2C5E] text-sm font-bold" >
										Campus Check-In
									</span>
									<span className="text-[#8A8A8A] text-[13px]" >
										Question 2 of 5
									</span>
								</div>
								<div className="items-start self-stretch bg-[#E8E0D8] rounded-[3px]">
									<div className="bg-[#4A2C5E] w-64 h-1.5">
									</div>
								</div>
							</div>
							<div className="flex flex-col items-start bg-white w-[640px] p-10 gap-8 rounded-3xl border border-solid border-[#E8E0D8]">
								<span className="text-[#4A2C5E] text-xl font-bold w-[477px]" >
									Over the past two weeks, how often have you felt nervous or on edge?
								</span>
								<div className="flex flex-col self-stretch gap-3">
									<div className="flex items-center self-stretch bg-[#F5EDE3] rounded-xl">
										<div className="bg-white w-5 h-5 ml-4 mr-3 rounded-[10px] border border-solid border-[#E8E0D8]">
										</div>
										<input
											placeholder="Not at all"
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="flex-1 self-stretch text-[#2A2A2A] bg-transparent text-[15px] py-4 mr-1 border-0"
										/>
									</div>
									<div className="flex items-center self-stretch bg-[#4A2C5E0D] py-4 rounded-xl border border-solid border-[#4A2C5E]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lbjtbugh_expires_30_days.png"} 
											className="w-5 h-5 ml-4 mr-3 rounded-[10px] object-fill"
										/>
										<span className="text-[#4A2C5E] text-[15px] font-bold" >
											A few days
										</span>
									</div>
									<div className="flex items-center self-stretch bg-[#F5EDE3] rounded-xl">
										<div className="bg-white w-5 h-5 ml-4 mr-3 rounded-[10px] border border-solid border-[#E8E0D8]">
										</div>
										<input
											placeholder="More than half the days"
											value={input2}
											onChange={(event)=>onChangeInput2(event.target.value)}
											className="flex-1 self-stretch text-[#2A2A2A] bg-transparent text-[15px] py-4 mr-1 border-0"
										/>
									</div>
									<div className="flex items-center self-stretch bg-[#F5EDE3] rounded-xl">
										<div className="bg-white w-5 h-5 ml-4 mr-3 rounded-[10px] border border-solid border-[#E8E0D8]">
										</div>
										<input
											placeholder="Nearly every day"
											value={input3}
											onChange={(event)=>onChangeInput3(event.target.value)}
											className="flex-1 self-stretch text-[#2A2A2A] bg-transparent text-[15px] py-4 mr-1 border-0"
										/>
									</div>
									<div className="flex items-center self-stretch bg-[#F5EDE3] rounded-xl">
										<div className="bg-white w-5 h-5 ml-4 mr-3 rounded-[10px] border border-solid border-[#E8E0D8]">
										</div>
										<input
											placeholder="I'd rather not say"
											value={input4}
											onChange={(event)=>onChangeInput4(event.target.value)}
											className="flex-1 self-stretch text-[#2A2A2A] bg-transparent text-[15px] py-4 mr-1 border-0"
										/>
									</div>
								</div>
								<div className="flex justify-between items-center self-stretch">
									<div className="flex flex-col shrink-0 items-start py-3 px-6 rounded-[999px]">
										<span className="text-[#8A8A8A] text-[15px] font-bold" >
											Back
										</span>
									</div>
									<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-3 px-8 rounded-[999px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-[15px] font-bold" >
											Continue
										</span>
									</button>
								</div>
							</div>
							<div className="bg-[#4A2C5E] w-[640px] p-10 rounded-3xl">
								<div className="flex flex-col items-start self-stretch mb-7 gap-1.5">
									<span className="text-[#FFF8F0] text-2xl font-bold" >
										Your Wellness Portrait
									</span>
									<span className="text-[#FFF8F0] text-sm" >
										Based on your private self-check inputs this semester.
									</span>
								</div>
								<div className="self-stretch bg-[#FFF8F0] h-[1px] mb-[27px]">
								</div>
								<div className="flex flex-col self-stretch mb-7 gap-4">
									<div className="flex items-start self-stretch gap-3">
										<span className="text-black text-lg" >
											📝
										</span>
										<div className="flex flex-1 flex-col items-start gap-1">
											<span className="text-[#FFF8F0] text-base font-bold" >
												Mindful Awareness
											</span>
											<span className="text-[#FFF8F0] text-sm w-[511px]" >
												You tend to check in during exam cycles, which builds high self-reflection when under pressure.
											</span>
										</div>
									</div>
									<div className="flex items-start self-stretch gap-3">
										<span className="text-black text-lg" >
											⚡
										</span>
										<div className="flex flex-1 flex-col items-start gap-1">
											<span className="text-[#FFF8F0] text-base font-bold" >
												Academic Stress Focus
											</span>
											<span className="text-[#FFF8F0] text-sm w-[465px]" >
												Most anxious spikes align closely with placement deadlines and seminar presentation weeks.
											</span>
										</div>
									</div>
									<div className="flex items-start self-stretch gap-3">
										<span className="text-black text-lg" >
											🌱
										</span>
										<div className="flex flex-1 flex-col items-start gap-1">
											<span className="text-[#FFF8F0] text-base font-bold" >
												Peer Space Potential
											</span>
											<span className="text-[#FFF8F0] text-sm" >
												Joining the &#39;B.Tech Placements Mindset&#39; circle may ease isolation on tough days.
											</span>
										</div>
									</div>
								</div>
								<div className="flex items-center self-stretch gap-3">
									<button className="flex flex-col shrink-0 items-start bg-[#FFFFFF1F] text-left py-3 px-[70px] rounded-[999px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-sm font-bold" >
											Save to my insights
										</span>
									</button>
									<div className="flex flex-col shrink-0 items-start py-3 px-[109px] rounded-[999px]">
										<span className="text-[#FFF8F0] text-sm font-bold" >
											Not now
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