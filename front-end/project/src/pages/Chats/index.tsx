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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/db557vjl_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jo8coran_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lofnv95d_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/sbowntbq_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5iwwccbf_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E1A] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/3ap1p1jd_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/f5ezq0n8_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/uzyz000w_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/t1alg76u_expires_30_days.png"} 
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
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/u05sxa9k_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[406px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/pibfiqw0_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Chats
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/c6vq73oh_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/v1j3r9oo_expires_30_days.png"} 
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
						<div className="flex items-start self-stretch pt-10 pb-[315px] px-10 gap-6">
							<div className="flex flex-1 flex-col gap-6">
								<div className="flex justify-between items-center self-stretch">
									<span className="text-[#4A2C5E] text-[32px] font-bold" >
										Your Conversations
									</span>
									<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-[9px] px-5 rounded-[999px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-sm font-bold" >
											New Chat
										</span>
									</button>
								</div>
								<div className="flex items-center self-stretch gap-4">
									<div className="flex flex-1 items-center bg-white rounded-lg border border-solid border-[#E8E0D8]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/b960q220_expires_30_days.png"} 
											className="w-4 h-4 ml-4 mr-2.5 rounded-lg object-fill"
										/>
										<input
											placeholder="Search rooms or names..."
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="flex-1 self-stretch text-[#8A8A8A] bg-transparent text-sm py-2.5 mr-1 border-0"
										/>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-[7px] px-4 rounded-[999px] border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-white text-[13px] font-bold" >
												All
											</span>
										</button>
										<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[7px] px-4 rounded-[999px] border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-[13px]" >
												Unread
											</span>
										</button>
										<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-[7px] px-4 rounded-[999px] border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-[13px]" >
												Rooms
											</span>
										</button>
									</div>
								</div>
								<div className="self-stretch bg-white p-2 rounded-2xl border border-solid border-[#E8E0D8]" 
									style={{
										boxShadow: "0px 4px 16px #4A2C5E08"
									}}>
									<div className="flex items-center self-stretch bg-[#4A2C5E08] p-4 gap-4 rounded-xl">
										<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left p-[15px] rounded-3xl border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-lg font-bold" >
												💬
											</span>
										</button>
										<div className="flex flex-1 flex-col gap-1">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[15px] font-bold" >
													Exam Overwhelm
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													2m ago
												</span>
											</div>
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[13px]" >
													Rahul: Anyone else struggling with the final semester syllabus?
												</span>
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/gz338d6h_expires_30_days.png"} 
													className="w-2 h-2 object-fill"
												/>
											</div>
										</div>
									</div>
									<div className="flex items-center self-stretch bg-[#4A2C5E08] p-4 gap-4 rounded-xl">
										<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-[13px] px-[11px] rounded-3xl border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-white text-lg font-bold" >
												RS
											</span>
										</button>
										<div className="flex flex-1 flex-col gap-1">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[15px] font-bold" >
													Counsellor Rahul Sen
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													1h ago
												</span>
											</div>
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[13px]" >
													Let&#39;s schedule our next check-in for Tuesday morning.
												</span>
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/pc78xdns_expires_30_days.png"} 
													className="w-2 h-2 object-fill"
												/>
											</div>
										</div>
									</div>
									<div className="flex items-center self-stretch p-4 gap-4 rounded-xl">
										<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left p-[15px] rounded-3xl border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-lg font-bold" >
												🎯
											</span>
										</button>
										<div className="flex flex-1 flex-col gap-[3px]">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[15px] font-bold" >
													Placement Anxiety Circle
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													3h ago
												</span>
											</div>
											<div className="flex flex-col items-start self-stretch">
												<span className="text-[#2A2A2A] text-[13px]" >
													Sneha: I just got rejected from the second round too...
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center self-stretch p-4 gap-4 rounded-xl">
										<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left p-[15px] rounded-3xl border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-lg font-bold" >
												🌸
											</span>
										</button>
										<div className="flex flex-1 flex-col gap-[3px]">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[15px] font-bold" >
													Quiet Space #12
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													Yesterday
												</span>
											</div>
											<div className="flex flex-col items-start self-stretch">
												<span className="text-[#2A2A2A] text-[13px]" >
													You: Thanks for sharing this. It really helps to know...
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center self-stretch p-4 gap-4 rounded-xl">
										<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-[13px] px-[9px] rounded-3xl border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-white text-lg font-bold" >
												MF
											</span>
										</button>
										<div className="flex flex-1 flex-col gap-[3px]">
											<div className="flex justify-between items-center self-stretch">
												<span className="text-[#2A2A2A] text-[15px] font-bold" >
													Meera Fernandez
												</span>
												<span className="text-[#8A8A8A] text-xs" >
													2 days ago
												</span>
											</div>
											<div className="flex flex-col items-start self-stretch">
												<span className="text-[#2A2A2A] text-[13px]" >
													Take deep breaths. You&#39;ve got this.
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="flex justify-center items-center self-stretch gap-1.5">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/b8bi6a1a_expires_30_days.png"} 
										className="w-3 h-3 object-fill"
									/>
									<span className="text-[#8A8A8A] text-xs" >
										Anonymous and private by default.
									</span>
								</div>
							</div>
							<div className="flex flex-col w-[280px] gap-6">
								<div className="flex flex-col items-start self-stretch bg-white py-6 pr-6 gap-4 rounded-2xl border border-solid border-[#E8E0D8]">
									<span className="text-[#4A2C5E] text-base font-bold ml-6" >
										Comfort Circle
									</span>
									<div className="flex flex-col self-stretch ml-6 gap-3">
										<div className="flex items-center self-stretch gap-3">
											<button className="flex flex-col shrink-0 items-start bg-[#7B9E6B] text-left py-2 px-1.5 rounded-2xl border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-white text-xs font-bold" >
													MF
												</span>
											</button>
											<div className="flex flex-col shrink-0 items-start gap-0.5">
												<span className="text-[#2A2A2A] text-[13px] font-bold" >
													Meera Fernandez
												</span>
												<span className="text-[#8A8A8A] text-[11px] mr-[55px]" >
													Counsellor
												</span>
											</div>
										</div>
										<div className="flex items-center self-stretch gap-3">
											<button className="flex flex-col shrink-0 items-start bg-[#C45D3E] text-left py-2 px-[7px] rounded-2xl border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-white text-xs font-bold" >
													RS
												</span>
											</button>
											<div className="flex flex-col shrink-0 items-center gap-0.5">
												<span className="text-[#2A2A2A] text-[13px] font-bold" >
													Rahul Sen
												</span>
												<span className="text-[#8A8A8A] text-[11px]" >
													Counsellor
												</span>
											</div>
										</div>
										<div className="flex items-center self-stretch gap-3">
											<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-2 px-[11px] rounded-2xl border-0"
												onClick={()=>alert("Pressed!")}>
												<span className="text-white text-xs font-bold" >
													A
												</span>
											</button>
											<div className="flex flex-col shrink-0 items-start gap-0.5">
												<span className="text-[#2A2A2A] text-[13px] font-bold mr-[70px]" >
													Aisha
												</span>
												<span className="text-[#8A8A8A] text-[11px]" >
													Student Companion
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-col items-start self-stretch bg-[#7B9E6B1A] py-6 pr-6 gap-4 rounded-2xl border border-solid border-[#7B9E6B24]">
									<div className="flex items-center ml-6 gap-2">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/h0gkvsn6_expires_30_days.png"} 
											className="w-4 h-4 object-fill"
										/>
										<span className="text-[#5C7A4F] text-base font-bold" >
											Safety Sanctuary
										</span>
									</div>
									<div className="flex flex-col self-stretch ml-6 gap-3">
										<div className="flex items-start self-stretch gap-[11px]">
											<span className="text-[#5C7A4F] text-xs" >
												•
											</span>
											<span className="flex-1 text-[#2A2A2A] text-xs" >
												Be kind and empathetic to student struggles.
											</span>
										</div>
										<div className="flex items-start self-stretch gap-[11px]">
											<span className="text-[#5C7A4F] text-xs" >
												•
											</span>
											<span className="flex-1 text-[#2A2A2A] text-xs" >
												No sharing of phone numbers or real-world names.
											</span>
										</div>
										<div className="flex items-start self-stretch gap-[11px]">
											<span className="text-[#5C7A4F] text-xs" >
												•
											</span>
											<span className="flex-1 text-[#2A2A2A] text-xs" >
												Your university ID is never exposed to anyone.
											</span>
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