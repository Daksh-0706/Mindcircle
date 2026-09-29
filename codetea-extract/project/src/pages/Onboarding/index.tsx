import React from "react";
export default (props) => {
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] pt-10 px-[120px] overflow-hidden">
				<div className="flex justify-between items-center self-stretch mb-10">
					<div className="flex shrink-0 items-center gap-2">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/0cgfm7vb_expires_30_days.png"} 
							className="w-8 h-8 rounded-2xl object-fill"
						/>
						<span className="text-[#4A2C5E] text-xl font-bold" >
							MindCircle
						</span>
					</div>
					<div className="flex shrink-0 items-center">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/r2uvnr2e_expires_30_days.png"} 
							className="w-2 h-2 mr-3 object-fill"
						/>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/bkez48nh_expires_30_days.png"} 
							className="w-2 h-2 mr-[11px] object-fill"
						/>
						<div className="bg-[#C45D3E] w-6 h-2 rounded-[99px]">
						</div>
					</div>
					<span className="text-[#8A8A8A] text-sm font-bold" >
						Skip onboarding
					</span>
				</div>
				<div className="flex items-center self-stretch mb-12 gap-10">
					<div className="flex flex-1 flex-col gap-6">
						<div className="flex flex-col items-start self-stretch bg-white py-8 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
							<div className="flex flex-col items-start bg-[#7B9E6B1F] py-1 px-3 ml-8 rounded-[99px]">
								<span className="text-[#5C7A4F] text-[11px] font-bold" >
									Stage 01
								</span>
							</div>
							<span className="text-[#4A2C5E] text-[28px] font-bold ml-8" >
								Your space, your pace
							</span>
							<span className="text-[#2A2A2A] text-[15px] w-[454px] ml-8" >
								Reflect privately without campus eyes on you. Log your daily head space or capture thoughts in a quiet, lockable sanctuary.
							</span>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/hdtf6myp_expires_30_days.png"} 
								className="w-[474px] h-[100px] ml-8 rounded-xl object-fill"
							/>
						</div>
						<div className="flex flex-col items-start self-stretch bg-white py-8 gap-5 rounded-[20px] border border-solid border-[#E8E0D8]">
							<div className="flex flex-col items-start bg-[#4A2C5E14] py-1 px-3 ml-8 rounded-[99px]">
								<span className="text-[#4A2C5E] text-[11px] font-bold" >
									Stage 02
								</span>
							</div>
							<span className="text-[#4A2C5E] text-[28px] font-bold ml-8" >
								You&#39;re never really alone
							</span>
							<span className="text-[#2A2A2A] text-[15px] w-[458px] ml-8" >
								Share what&#39;s on your mind inside anonymous campus peer circles. Walk with student networks who genuinely understand.
							</span>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/can4n5wh_expires_30_days.png"} 
								className="w-[474px] h-[100px] ml-8 rounded-xl object-fill"
							/>
						</div>
					</div>
					<div className="flex flex-1 flex-col bg-white p-10 gap-8 rounded-[20px] border border-solid border-[#4A2C5E]" 
						style={{
							boxShadow: "0px 12px 24px #4A2C5E14"
						}}>
						<div className="flex flex-col items-start self-stretch gap-3">
							<div className="flex flex-col items-start bg-[#C45D3E14] py-1 px-3 rounded-[99px]">
								<span className="text-[#A04830] text-[11px] font-bold" >
									Stage 03 • Setup
								</span>
							</div>
							<span className="text-[#4A2C5E] text-[32px] font-bold" >
								What feels right for you?
							</span>
							<span className="text-[#2A2A2A] text-[15px]" >
								Pick what draws you in. You can always change this.
							</span>
						</div>
						<div className="flex flex-col items-start self-stretch pr-[47px] gap-2.5">
							<div className="flex items-center self-stretch gap-2.5">
								<button className="flex shrink-0 items-center bg-[#4A2C5E0D] text-left py-2 px-4 gap-1.5 rounded-[999px] border border-solid border-[#4A2C5E]"
									onClick={()=>alert("Pressed!")}>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/fy6oj3to_expires_30_days.png"} 
										className="w-1.5 h-1.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#4A2C5E] text-sm font-bold" >
										Journaling
									</span>
								</button>
								<button className="flex shrink-0 items-center bg-[#4A2C5E0D] text-left py-2 px-4 gap-1.5 rounded-[999px] border border-solid border-[#4A2C5E]"
									onClick={()=>alert("Pressed!")}>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/zn4t2zcc_expires_30_days.png"} 
										className="w-1.5 h-1.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#4A2C5E] text-sm font-bold" >
										Peer support
									</span>
								</button>
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2 px-4 rounded-[999px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#2A2A2A] text-sm" >
										Counselling
									</span>
								</button>
								<button className="flex shrink-0 items-center bg-[#4A2C5E0D] text-left py-2 px-4 gap-1.5 rounded-[999px] border border-solid border-[#4A2C5E]"
									onClick={()=>alert("Pressed!")}>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/np0138r3_expires_30_days.png"} 
										className="w-1.5 h-1.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#4A2C5E] text-sm font-bold" >
										Activities
									</span>
								</button>
							</div>
							<button className="flex flex-col items-start bg-[#F5EDE3] text-left py-2 px-4 rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#2A2A2A] text-sm" >
									Mood tracking
								</span>
							</button>
						</div>
						<div className="flex items-center self-stretch bg-[#7B9E6B0F] p-4 gap-[11px] rounded-xl border border-solid border-[#7B9E6B2E]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/u3ua6vnm_expires_30_days.png"} 
								className="w-6 h-6 rounded-xl object-fill"
							/>
							<div className="flex flex-1 flex-col items-start gap-0.5">
								<span className="text-[#5C7A4F] text-sm font-bold" >
									You&#39;re all set, Priya
								</span>
								<span className="text-[#2A2A2A] text-xs" >
									Your anonymous profile is active and verified secure.
								</span>
							</div>
						</div>
						<div className="flex items-center self-stretch gap-3">
							<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-3.5 px-6 rounded-[999px] border border-solid border-[#4A2C5E]"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#4A2C5E] text-[15px] font-bold" >
									Back
								</span>
							</button>
							<button className="flex flex-1 justify-center items-center bg-[#4A2C5E] text-left py-3.5 gap-[11px] rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-[15px] font-bold" >
									Go to dashboard
								</span>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/xl1rw745_expires_30_days.png"} 
									className="w-4 h-4 rounded-[999px] object-fill"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}