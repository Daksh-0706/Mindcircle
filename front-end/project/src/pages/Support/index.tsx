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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/fgzmprub_expires_30_days.png"} 
								className="w-8 h-8 rounded-2xl object-fill"
							/>
							<span className="text-[#4A2C5E] text-[22px] font-bold" >
								MindCircle
							</span>
						</div>
						<div className="flex flex-col self-stretch mb-7 gap-1.5">
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/582necaq_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Dashboard
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/8ibg97ea_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Journal
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1s74fsyu_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Connect
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/b5y2izz7_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Insights
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/e906l9i7_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Chats
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/k1ovezqa_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Activities
								</span>
							</div>
							<div className="flex items-center self-stretch py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1qzkqe6n_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-3 rounded-[999px] object-fill"
								/>
								<span className="text-[#2A2A2A] text-sm" >
									Counsellors
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#4A2C5E14] py-2.5 rounded-[999px]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9vmhd8cd_expires_30_days.png"} 
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
							<div className="flex items-center self-stretch bg-[#7B9E6B1A] py-3 rounded-xl">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/phm7ug65_expires_30_days.png"} 
									className="w-[18px] h-[18px] ml-4 mr-2.5 rounded-xl object-fill"
								/>
								<span className="text-[#5C7A4F] text-[13px] font-bold" >
									Crisis Support
								</span>
							</div>
						</div>
						<div className="flex justify-between items-start self-stretch mb-[913px]">
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
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/3m89htjy_expires_30_days.png"} 
								className="w-4 h-4 mt-[23px] object-fill"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="flex justify-between items-center self-stretch bg-[#FFF8F0CC] py-4 px-10">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Support &amp; Feedback
							</span>
							<div className="flex shrink-0 items-center gap-6">
								<div className="flex shrink-0 items-center bg-[#FFFFFFB3] py-[7px] px-4 gap-2 rounded-[999px] border border-solid border-[#E8E0D8]">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/tadr50h0_expires_30_days.png"} 
										className="w-3.5 h-3.5 rounded-[999px] object-fill"
									/>
									<span className="text-[#8A8A8A] text-[13px]" >
										Search...
									</span>
								</div>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/018o5ihh_expires_30_days.png"} 
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
							<div className="flex flex-col items-start self-stretch gap-2">
								<span className="text-[#4A2C5E] text-[32px] font-bold" >
									Support Sanctuary
								</span>
								<span className="text-[#6A6865] text-base" >
									Need assistance, spotted a bug, or want to share feedback? We&#39;re here to help you guide MindCircle.
								</span>
							</div>
							<div className="flex items-center self-stretch bg-[#7B9E6B1A] p-5 gap-4 rounded-2xl border border-solid border-[#7B9E6B]">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/lulue9cu_expires_30_days.png"} 
									className="w-8 h-8 rounded-2xl object-fill"
								/>
								<div className="flex flex-1 flex-col items-start gap-0.5">
									<span className="text-[#5C7A4F] text-[15px] font-bold" >
										Message received successfully
									</span>
									<span className="text-[#2A2A2A] text-[13px]" >
										Our team has logged your ticket. Keep this ID for tracking: REF-2024-0847. We&#39;ll update your inbox shortly.
									</span>
								</div>
							</div>
							<div className="flex items-start self-stretch gap-6">
								<div className="flex flex-1 flex-col gap-5">
									<div className="flex flex-col items-start self-stretch bg-white py-6 gap-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex items-center ml-6 gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/u4q9oa3u_expires_30_days.png"} 
												className="w-10 h-10 rounded-[20px] object-fill"
											/>
											<div className="flex flex-col shrink-0 items-center gap-0.5">
												<span className="text-[#4A2C5E] text-lg font-bold" >
													Email us directly
												</span>
												<span className="text-[#C45D3E] text-sm font-bold" >
													support@mindcircle.in
												</span>
											</div>
										</div>
										<span className="text-[#80698A] text-sm ml-6" >
											We reply within 2 working days. Strictly confidential support.
										</span>
										<button className="flex flex-col items-start bg-[#4A2C5E] text-left py-2.5 px-4 ml-6 rounded-[999px] border-0"
											onClick={()=>alert("Pressed!")}>
											<span className="text-white text-sm font-bold" >
												Send email
											</span>
										</button>
									</div>
									<div className="flex flex-col items-start self-stretch bg-white py-6 gap-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex items-center ml-6 gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/9g39od7m_expires_30_days.png"} 
												className="w-10 h-10 rounded-[20px] object-fill"
											/>
											<span className="text-[#4A2C5E] text-lg font-bold" >
												Report a concern
											</span>
										</div>
										<span className="text-[#6A6865] text-sm w-[654px] ml-6" >
											Spotted something unsafe or inappropriate in peer circles? Help us keep MindCircle safe by reporting immediately.
										</span>
										<button className="flex flex-col items-start bg-transparent text-left py-2.5 px-4 ml-6 rounded-[999px] border border-solid border-[#4A2C5E]"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-sm font-bold" >
												Report
											</span>
										</button>
									</div>
									<div className="flex flex-col items-start self-stretch bg-white py-6 gap-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<div className="flex items-center ml-6 gap-3">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/imvrucl4_expires_30_days.png"} 
												className="w-10 h-10 rounded-[20px] object-fill"
											/>
											<span className="text-[#4A2C5E] text-lg font-bold" >
												Share feedback
											</span>
										</div>
										<span className="text-[#6A6865] text-sm w-[657px] ml-6" >
											Tell us what features you would love to see, how journaling is helping you, or how we can make our app experience smoother.
										</span>
										<button className="flex flex-col items-start bg-transparent text-left py-2.5 px-4 ml-6 rounded-[999px] border border-solid border-[#4A2C5E]"
											onClick={()=>alert("Pressed!")}>
											<span className="text-[#4A2C5E] text-sm font-bold" >
												Give feedback
											</span>
										</button>
									</div>
								</div>
								<div className="flex flex-col w-[380px] gap-6">
									<div className="flex flex-col items-start self-stretch bg-white py-6 pr-6 gap-5 rounded-2xl border border-solid border-[#E8E0D8]">
										<span className="text-[#4A2C5E] text-lg font-bold ml-6" >
											Before you write
										</span>
										<div className="flex flex-col self-stretch ml-6 gap-3.5">
											<div className="flex items-center self-stretch gap-2">
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/e083bzhe_expires_30_days.png"} 
													className="w-3.5 h-3.5 object-fill"
												/>
												<span className="text-[#2A2A2A] text-sm font-bold" >
													How is my anonymity guaranteed?
												</span>
											</div>
											<div className="flex items-center self-stretch gap-2">
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/yjw3869n_expires_30_days.png"} 
													className="w-3.5 h-3.5 object-fill"
												/>
												<span className="text-[#2A2A2A] text-sm font-bold" >
													Can college administrators read my journals?
												</span>
											</div>
											<div className="flex items-center self-stretch gap-2">
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/1jdy828t_expires_30_days.png"} 
													className="w-3.5 h-3.5 object-fill"
												/>
												<span className="text-[#2A2A2A] text-sm font-bold" >
													How do I book a counseling slot?
												</span>
											</div>
											<div className="flex items-center self-stretch gap-2">
												<img
													src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/ftuidu4l_expires_30_days.png"} 
													className="w-3.5 h-3.5 object-fill"
												/>
												<span className="text-[#2A2A2A] text-sm font-bold" >
													How to reset my campus verification loop?
												</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch bg-[#7B9E6B1A] py-6 gap-4 rounded-2xl border border-solid border-[#7B9E6B]">
										<div className="flex items-center ml-6 gap-2">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/l10sgnyn_expires_30_days.png"} 
												className="w-[18px] h-[18px] object-fill"
											/>
											<span className="text-[#5C7A4F] text-sm font-bold" >
												Urgent Emergency?
											</span>
										</div>
										<span className="text-[#2A2A2A] text-sm w-80 ml-6" >
											If this is urgent, please use Crisis Support instead. Get in touch with verified national helpline counselors immediately.
										</span>
										<div className="flex items-center ml-6 gap-[7px]">
											<span className="text-[#5C7A4F] text-sm font-bold" >
												Go to Crisis Support
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/o6fsvyx0_expires_30_days.png"} 
												className="w-3.5 h-3.5 object-fill"
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-start self-stretch bg-white py-8 pr-8 gap-6 rounded-[20px] border border-solid border-[#E8E0D8]">
								<span className="text-[#4A2C5E] text-[22px] font-bold ml-8" >
									Send a direct message
								</span>
								<div className="flex flex-col items-start self-stretch ml-8 gap-4">
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-[13px] font-bold" >
											Select a topic
										</span>
										<div className="flex justify-between items-center self-stretch bg-[#F5EDE3] py-3 px-4 rounded-lg">
											<span className="text-[#2A2A2A] text-sm" >
												General Support / App Issues
											</span>
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/w6t7a7e2_expires_30_days.png"} 
												className="w-4 h-4 rounded-lg object-fill"
											/>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-[13px] font-bold" >
											Describe your concern
										</span>
										<div className="flex flex-col self-stretch pt-3.5 pl-4 pr-[62px] rounded-lg border border-solid border-[#E8E0D8]">
											<span className="text-[#2A2A2A] text-sm mb-[70px]" >
												I am experiencing placement anxiety, and I&#39;d like to report that one of the peer circles had an active spam account talking about commercial placement guides.
											</span>
										</div>
									</div>
									<div className="flex flex-col items-start self-stretch gap-2">
										<span className="text-[#2A2A2A] text-[13px]" >
											Your contact email (optional, strictly confidential)
										</span>
										<input
											placeholder="priya.k@university.edu.in"
											value={input1}
											onChange={(event)=>onChangeInput1(event.target.value)}
											className="self-stretch text-[#2A2A2A] bg-transparent text-sm py-3 px-4 rounded-lg border border-solid border-[#E8E0D8]"
										/>
									</div>
									<button className="flex flex-col items-start bg-[#4A2C5E] text-left py-3.5 px-6 rounded-[999px] border-0"
										onClick={()=>alert("Pressed!")}>
										<span className="text-white text-[15px] font-bold" >
											Send message
										</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}