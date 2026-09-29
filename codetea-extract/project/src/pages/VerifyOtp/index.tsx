import React from "react";
export default (props) => {
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-1 flex-col items-center py-16">
						<div className="flex items-center mb-[173px]">
							<div className="flex shrink-0 items-center mr-[137px] gap-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jkkbbnzg_expires_30_days.png"} 
									className="w-8 h-8 rounded-2xl object-fill"
								/>
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									MindCircle
								</span>
							</div>
							<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[5px] px-3 rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#5C7A4F] text-xs font-bold" >
									Secure Loop
								</span>
							</button>
						</div>
						<div className="flex flex-col w-[400px] mb-[172px] gap-8">
							<div className="flex flex-col items-start self-stretch gap-3">
								<span className="text-[#4A2C5E] text-4xl font-bold" >
									Check your messages
								</span>
								<span className="text-[#2A2A2A] text-base w-[276px]" >
									We sent a 6-digit verification code to pr***@email.com
								</span>
							</div>
							<div className="flex flex-col items-start self-stretch gap-3">
								<span className="text-[#2A2A2A] text-[13px] font-bold" >
									Verification Code
								</span>
								<div className="flex justify-center items-center self-stretch gap-3">
									<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-4 rounded-lg border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-[#4A2C5E] text-[22px] font-bold" >
											4
										</span>
									</button>
									<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-4 rounded-lg border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-[#4A2C5E] text-[22px] font-bold" >
											9
										</span>
									</button>
									<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-4 rounded-lg border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-[#4A2C5E] text-[22px] font-bold" >
											2
										</span>
									</button>
									<div className="bg-[#F5EDE3] w-12 h-12 rounded-lg border-2 border-solid border-[#4A2C5E]" 
										style={{
											boxShadow: "0px 0px 4px #4A2C5E1A"
										}}>
									</div>
									<div className="bg-[#F5EDE3] w-12 h-12 rounded-lg">
									</div>
									<div className="bg-[#F5EDE3] w-12 h-12 rounded-lg">
									</div>
								</div>
							</div>
							<div className="flex justify-between items-center self-stretch">
								<div className="flex shrink-0 items-center gap-1.5">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/au7iabvn_expires_30_days.png"} 
										className="w-1.5 h-1.5 object-fill"
									/>
									<span className="text-[#2A2A2A] text-xs" >
										Resend code in 45s
									</span>
								</div>
								<span className="text-[#8A8A8A] text-xs font-bold" >
									Resend code
								</span>
							</div>
							<div className="flex flex-col self-stretch gap-[19px]">
								<button className="flex flex-col items-center self-stretch text-left py-[13px] rounded-[999px] border-0" 
									style={{
										background: "linear-gradient(180deg, #4A2C5E, #C45D3E)"
									}}
									onClick={()=>alert("Pressed!")}>
									<span className="text-white text-[15px] font-bold" >
										Verify
									</span>
								</button>
								<div className="flex flex-col items-center self-stretch">
									<span className="text-[#A04830] text-xs font-bold 
										textDecorationLine: underline" >
										Use password instead
									</span>
								</div>
							</div>
						</div>
						<span className="text-[#8A8A8A] text-xs" >
							Didn&#39;t receive an email? Check your spam folder or contact support@mindcircle.in
						</span>
					</div>
					<div className="flex flex-col items-center bg-[#4A2C5E] w-[580px] py-16">
						<div className="flex flex-col items-start w-[452px] relative mb-[211px]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/d7y6rlzv_expires_30_days.png"} 
								className="w-[300px] h-[400px] absolute bottom-[22px] right-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch">
								<div className="flex items-center mb-[211px] gap-2">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/tqbutjmr_expires_30_days.png"} 
										className="w-8 h-8 rounded-2xl object-fill"
									/>
									<span className="text-[#FFF8F0] text-[22px] font-bold" >
										MindCircle
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch gap-4">
									<span className="text-[#FFF8F0] text-[38px] font-bold w-[435px]" >
										Your campus sanctuary is one step away.
									</span>
									<div className="bg-[#C45D3E] w-[60px] h-[3px] rounded-[1px]">
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-start w-[452px] relative">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/hu0e4zmp_expires_30_days.png"} 
								className="w-[350px] h-[350px] absolute bottom-9 left-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch gap-8">
								<span className="text-[#FFF8F0] text-[13px] font-bold" >
									Reflections from the Circle
								</span>
								<div className="flex flex-col self-stretch gap-6">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base w-[434px]" >
											“Verified circles are led by trained guides who understand our daily hostel struggles.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— Second Year Design Student, Delhi
										</span>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base w-[412px]" >
											“I love that I can track my mood daily and get personalized prompts right when exams start.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— First Year MBA Candidate, Pune
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