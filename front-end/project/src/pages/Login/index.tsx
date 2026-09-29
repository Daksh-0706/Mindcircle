import React, {useState} from "react";
export default (props) => {
	const [input1, onChangeInput1] = useState('');
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-center self-stretch">
					<div className="flex flex-1 flex-col items-center py-16">
						<div className="flex items-center mb-[116px]">
							<div className="flex shrink-0 items-center mr-[134px] gap-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5msz58af_expires_30_days.png"} 
									className="w-8 h-8 rounded-2xl object-fill"
								/>
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									MindCircle
								</span>
							</div>
							<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[5px] px-3 rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#A04830] text-xs font-bold" >
									Student Safe
								</span>
							</button>
						</div>
						<div className="flex flex-col w-[400px] mb-[116px] gap-8">
							<div className="flex flex-col items-start self-stretch gap-3">
								<span className="text-[#4A2C5E] text-4xl font-bold" >
									Welcome back
								</span>
								<span className="text-[#2A2A2A] text-base" >
									Take a quiet breath and step back inside.
								</span>
							</div>
							<div className="flex flex-col self-stretch gap-5">
								<div className="flex flex-col items-start self-stretch gap-2">
									<span className="text-[#2A2A2A] text-[13px] font-bold" >
										Student Email
									</span>
									<input
										placeholder="kabir.sharma@iitd.ac.in"
										value={input1}
										onChange={(event)=>onChangeInput1(event.target.value)}
										className="self-stretch text-[#2A2A2A] bg-[#F5EDE3] text-sm py-[13px] px-4 rounded-lg border-0"
									/>
								</div>
								<div className="flex flex-col self-stretch gap-2">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-[13px] font-bold" >
											Password
										</span>
										<div className="flex justify-between items-center self-stretch bg-[#F5EDE3] py-[13px] px-4 rounded-lg border border-solid border-[#4A2C5E]" 
											style={{
												boxShadow: "0px 0px 4px #4A2C5E1A"
											}}>
											<span className="text-[#2A2A2A] text-sm" >
												studentpassword
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/yxchkz5s_expires_30_days.png"} 
												className="w-[18px] h-[18px] rounded-lg object-fill"
											/>
										</div>
									</div>
									<div className="flex flex-col items-end self-stretch pr-[3px]">
										<span className="text-[#A04830] text-xs font-bold" >
											Forgot password?
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col self-stretch gap-5">
								<button className="flex flex-col items-center self-stretch text-left py-3.5 rounded-[999px] border-0" 
									style={{
										background: "linear-gradient(180deg, #4A2C5E, #C45D3E)"
									}}
									onClick={()=>alert("Pressed!")}>
									<span className="text-white text-[15px] font-bold" >
										Sign in
									</span>
								</button>
								<div className="flex items-center self-stretch">
									<div className="bg-[#E8E0D8] w-[175px] h-[1px] mr-4">
									</div>
									<span className="text-[#8A8A8A] text-xs font-bold mr-[17px]" >
										or
									</span>
									<div className="bg-[#E8E0D8] w-[175px] h-[1px]">
									</div>
								</div>
								<button className="flex flex-col items-center self-stretch bg-transparent text-left py-3.5 rounded-[999px] border border-solid border-[#4A2C5E]"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#4A2C5E] text-[15px] font-bold" >
										Sign in with OTP
									</span>
								</button>
							</div>
						</div>
						<div className="flex flex-col items-start px-[101px]">
							<span className="text-[#2A2A2A] text-sm" >
								New here? Create an account
							</span>
						</div>
					</div>
					<div className="flex flex-col items-center bg-[#4A2C5E] w-[580px] py-16">
						<div className="flex flex-col items-start w-[452px] relative mb-[211px]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/y0ugdv4i_expires_30_days.png"} 
								className="w-[300px] h-[400px] absolute bottom-[22px] right-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch">
								<div className="flex items-center mb-[211px] gap-2">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/mpf0nai5_expires_30_days.png"} 
										className="w-8 h-8 rounded-2xl object-fill"
									/>
									<span className="text-[#FFF8F0] text-[22px] font-bold" >
										MindCircle
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch gap-4">
									<span className="text-[#FFF8F0] text-[38px] font-bold" >
										A quieter space to figure things out.
									</span>
									<div className="bg-[#C45D3E] w-[60px] h-[3px] rounded-[1px]">
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-start w-[452px] relative">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/bwq1dy3c_expires_30_days.png"} 
								className="w-[350px] h-[350px] absolute bottom-9 left-[-64px] object-fill"
							/>
							<div className="flex flex-col items-start self-stretch gap-8">
								<span className="text-[#FFF8F0] text-[13px] font-bold" >
									Reflections from the Circle
								</span>
								<div className="flex flex-col self-stretch gap-6">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base w-[409px]" >
											“Indian college life can feel like a nonstop race. MindCircle became my safe pause button.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— Final Year B.Tech Student, Bengaluru
										</span>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#FFF8F0] text-base" >
											“Knowing I can share my placement anxiety anonymously keeps me grounded.”
										</span>
										<span className="text-[#FFF8F0] text-xs" >
											— Third Year Commerce Student, Mumbai
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