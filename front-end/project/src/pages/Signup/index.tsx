import React, {useState} from "react";
export default (props) => {
	const [input1, onChangeInput1] = useState('');
	const [input2, onChangeInput2] = useState('');
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-1 flex-col items-center py-16">
						<div className="flex items-center mb-[106px]">
							<div className="flex shrink-0 items-center mr-[134px] gap-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/eey3l282_expires_30_days.png"} 
									className="w-8 h-8 rounded-2xl object-fill"
								/>
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									MindCircle
								</span>
							</div>
							<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[5px] px-3 rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#A04830] text-xs font-bold" >
									100% Private
								</span>
							</button>
						</div>
						<div className="flex flex-col w-[400px] mb-[105px] gap-7">
							<div className="flex flex-col items-start self-stretch gap-3">
								<span className="text-[#4A2C5E] text-4xl font-bold" >
									Create your space
								</span>
								<span className="text-[#2A2A2A] text-base w-[317px]" >
									Choose an alias or your real name. You stay anonymous to peers.
								</span>
							</div>
							<div className="flex flex-col self-stretch gap-4">
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#2A2A2A] text-[13px] font-bold" >
										Anonymous Alias (or Name)
									</span>
									<input
										placeholder="e.g. QuietSeeker, BlueSky, or your real name"
										value={input1}
										onChange={(event)=>onChangeInput1(event.target.value)}
										className="self-stretch text-[#8A8A8A] bg-[#F5EDE3] text-sm py-[13px] px-4 rounded-lg border-0"
									/>
								</div>
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#2A2A2A] text-[13px] font-bold" >
										Student Email (for secure verification only)
									</span>
									<input
										placeholder="yourname@college.edu.in"
										value={input2}
										onChange={(event)=>onChangeInput2(event.target.value)}
										className="self-stretch text-[#8A8A8A] bg-[#F5EDE3] text-sm py-[13px] px-4 rounded-lg border-0"
									/>
								</div>
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#2A2A2A] text-[13px] font-bold" >
										Choose Password
									</span>
									<div className="flex justify-between items-center self-stretch bg-[#F5EDE3] py-[13px] px-4 rounded-lg">
										<span className="text-[#8A8A8A] text-sm" >
											At least 8 characters
										</span>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/dh6ofctg_expires_30_days.png"} 
											className="w-[18px] h-[18px] rounded-lg object-fill"
										/>
									</div>
								</div>
								<div className="flex items-start self-stretch gap-3">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/0jemf0yp_expires_30_days.png"} 
										className="w-5 h-5 rounded-md object-fill"
									/>
									<span className="flex-1 text-[#2A2A2A] text-xs" >
										I understand MindCircle is a peer support community and is not a substitute for acute emergency psychiatric care.
									</span>
								</div>
							</div>
							<button className="flex flex-col items-center self-stretch text-left py-[13px] rounded-[999px] border-0" 
								style={{
									background: "linear-gradient(180deg, #4A2C5E, #C45D3E)"
								}}
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-[15px] font-bold" >
									Create account
								</span>
							</button>
						</div>
						<div className="flex flex-col items-start px-[92px]">
							<span className="text-[#2A2A2A] text-sm" >
								Already have an account? Sign in
							</span>
						</div>
					</div>
					<div className="flex flex-col items-center bg-[#4A2C5E] w-[580px] py-16">
						<div className="flex flex-col items-start w-[452px] relative mb-[211px]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/j0d0d8ro_expires_30_days.png"} 
								className="w-[300px] h-[400px] absolute bottom-[22px] right-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch">
								<div className="flex items-center mb-[211px] gap-2">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/35kug24j_expires_30_days.png"} 
										className="w-8 h-8 rounded-2xl object-fill"
									/>
									<span className="text-[#FFF8F0] text-[22px] font-bold" >
										MindCircle
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch gap-4">
									<span className="text-[#FFF8F0] text-[38px] font-bold w-[407px]" >
										No judgment. Entirely your sanctuary.
									</span>
									<div className="bg-[#C45D3E] w-[60px] h-[3px] rounded-[1px]">
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-start w-[452px] relative">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9i84jce5_expires_30_days.png"} 
								className="w-[350px] h-[350px] absolute bottom-9 left-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch gap-8">
								<span className="text-[#FFF8F0] text-[13px] font-bold" >
									Reflections from the Circle
								</span>
								<div className="flex flex-col self-stretch gap-6">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base w-[425px]" >
											“Being able to vent without my friends or parents finding out was exactly what I needed.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— Second Year Humanities Student, Kolkata
										</span>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base" >
											“We verify student status privately so you are guaranteed to talk only with real peers.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— System Architecture Team, MindCircle
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