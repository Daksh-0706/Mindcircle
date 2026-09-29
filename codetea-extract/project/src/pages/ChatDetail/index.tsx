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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/zhtsk3qm_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/awh7rqhg_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/4fewddu7_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/t8q73hqk_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/weq4lc8k_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E1A] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/zi7j7nlu_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ib2fh8yp_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/7hv8oct8_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/modfibv4_expires_30_days.png"} 
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
							<div className="flex items-center self-stretch bg-[#7B9E6B24] py-3 rounded-xl">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/dkdsfa06_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[306px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ef7k171k_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-3 px-10">
							<div className="flex shrink-0 items-center gap-3">
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left p-2.5 rounded-[19px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-black text-lg" >
										💬
									</span>
								</button>
								<div className="flex flex-col shrink-0 items-center gap-0.5">
									<span className="text-[#4A2C5E] text-lg font-bold" >
										Exam overwhelm
									</span>
									<span className="text-[#8A8A8A] text-xs" >
										Anonymous room · 18 here
									</span>
								</div>
							</div>
							<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-2 px-4 rounded-[999px] border border-solid border-[#4A2C5E]"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#4A2C5E] text-xs font-bold" >
									Speak to Host
								</span>
							</button>
						</div>
						<div className="flex items-center self-stretch">
							<div className="flex-1">
								<div className="flex flex-col self-stretch p-8 mb-[410px] gap-4">
									<div className="flex flex-col items-center self-stretch">
										<div className="flex flex-col items-start bg-[#F5EDE3] py-1 px-3 rounded-[999px]">
											<span className="text-[#8A8A8A] text-[11px] font-bold" >
												TODAY
											</span>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch relative">
										<div className="flex items-start self-stretch gap-2.5">
											<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2 px-[9px] rounded-2xl border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-black text-xs font-bold" >
													A1
												</span>
											</button>
											<div className="flex flex-col items-start w-[500px] gap-1">
												<div className="self-stretch bg-[#F5EDE3] h-[45px] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl">
												</div>
												<div className="flex items-center gap-1">
													<img
														src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/rjz8npo7_expires_30_days.png"} 
														className="w-2.5 h-2.5 object-fill"
													/>
													<span className="text-[#8A8A8A] text-[11px]" >
														Anonymous · 10:14 AM
													</span>
												</div>
											</div>
										</div>
										<span className="text-[#2A2A2A] text-sm absolute top-3 right-[-21px]" >
											Is anyone else having trouble sleeping because of the final year placement schedule? It feels like we are constantly competing.
										</span>
									</div>
									<div className="flex flex-col items-end self-stretch relative">
										<div className="flex flex-col items-center pt-[49px] pl-[430px]">
											<span className="text-[#8A8A8A] text-[11px]" >
												You · 10:15 AM
											</span>
										</div>
										<div className="bg-[#4A2C5E] w-[500px] h-[45px] absolute top-0 left-[87px] rounded-tl-2xl rounded-tr-2xl rounded-br rounded-bl-2xl">
										</div>
										<span className="text-white text-sm absolute top-3 right-3.5" >
											Yes, absolutely. The pressure is insane. I feel overwhelmed every morning checking the college placement channel.
										</span>
									</div>
									<div className="flex items-center self-stretch gap-2">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/w5seh6yp_expires_30_days.png"} 
											className="w-[26px] h-1.5 object-fill"
										/>
										<span className="text-[#8A8A8A] text-[11px]" >
											Someone is typing...
										</span>
									</div>
								</div>
								<div className="self-stretch bg-[#FFF8F0CC]">
									<div className="flex flex-col items-start self-stretch bg-[#F5EDE3] py-2 pl-8">
										<span className="text-[#2A2A2A] text-xs" >
											🔒 Everything shared here is private and entirely anonymous. Support one another with kindness.
										</span>
									</div>
									<div className="flex flex-col self-stretch p-5 gap-3">
										<div className="flex items-center self-stretch gap-4">
											<input
												placeholder="Type your safe reflection here..."
												value={input1}
												onChange={(event)=>onChangeInput1(event.target.value)}
												className="flex-1 self-stretch text-[#2A2A2A] bg-white text-sm py-3 px-4 rounded-lg border border-solid border-[#E8E0D8]"
											/>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/382nv8fb_expires_30_days.png"} 
												className="w-11 h-11 rounded-[22px] object-fill"
											/>
										</div>
										<div className="flex justify-between items-center self-stretch">
											<div className="flex shrink-0 items-center gap-2">
												<div className="flex flex-col shrink-0 items-start bg-white py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]">
													<span className="text-black text-xs" >
														❤️
													</span>
												</div>
												<div className="flex flex-col shrink-0 items-start bg-white py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]">
													<span className="text-black text-xs" >
														😌
													</span>
												</div>
												<div className="flex flex-col shrink-0 items-start bg-white py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]">
													<span className="text-black text-xs" >
														🙌
													</span>
												</div>
												<div className="flex flex-col shrink-0 items-start bg-white py-1.5 px-3 rounded-[999px] border border-solid border-[#E8E0D8]">
													<span className="text-black text-xs" >
														🫂
													</span>
												</div>
											</div>
											<span className="text-[#8A8A8A] text-[11px]" >
												280 / 500 characters
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col w-72 p-6">
								<div className="flex flex-col items-center self-stretch mb-5 gap-4">
									<button className="flex flex-col items-start bg-[#F5EDE3] text-left p-4 rounded-[32px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-black text-[32px]" >
											💬
										</span>
									</button>
									<div className="flex flex-col items-center self-stretch gap-1">
										<span className="text-[#4A2C5E] text-xl font-bold" >
											Exam overwhelm
										</span>
										<span className="text-[#8A8A8A] text-[13px]" >
											18 members active now
										</span>
									</div>
								</div>
								<div className="self-stretch bg-[#E8E0D8] h-[1px] mb-[19px]">
								</div>
								<div className="flex flex-col items-start self-stretch mb-5 gap-3">
									<span className="text-[#8A8A8A] text-xs font-bold" >
										About this room
									</span>
									<span className="text-[#2A2A2A] text-[13px]" >
										This room is a student-hosted circle for venting, grounding, and dealing with pressure before final semester exams. Completely unrecorded.
									</span>
								</div>
								<button className="flex flex-col items-center self-stretch bg-[#FF44440F] text-left py-3 mt-[452px] rounded-[999px] border border-solid border-[#FF444440]"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#FF4444] text-sm font-bold" >
										Leave room
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