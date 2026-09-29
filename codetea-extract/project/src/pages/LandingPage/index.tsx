import React from "react";
export default (props) => {
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex items-start self-stretch px-20">
					<div className="flex flex-1 flex-col items-start mt-[237px] mr-20 gap-9">
						<div className="flex flex-col items-start self-stretch gap-4">
							<span className="text-[#A04830] text-sm font-bold" >
								Built for students, by students
							</span>
							<span className="text-[#4A2C5E] text-[56px] font-bold w-[459px]" >
								A quieter place to figure things out
							</span>
							<span className="text-[#6A6865] text-lg w-[587px]" >
								Indian college life is a lot to handle—academics, placements, family expectations, and identity. MindCircle is your anonymous, safe campus sanctuary to share, pause, and find guidance.
							</span>
						</div>
						<div className="flex items-center gap-4">
							<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-3.5 px-7 rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-base font-bold" >
									Explore MindCircle
								</span>
							</button>
							<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-3.5 px-6 rounded-[999px] border border-solid border-[#4A2C5E]"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#4A2C5E] text-base font-bold" >
									How it works
								</span>
							</button>
						</div>
						<div className="flex flex-col self-stretch gap-3.5">
							<div className="flex items-center self-stretch gap-3">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/x8boamhh_expires_30_days.png"} 
									className="w-6 h-6 rounded-xl object-fill"
								/>
								<span className="text-[#2A2A2A] text-[15px]" >
									Anonymous by default — your identity stays entirely yours
								</span>
							</div>
							<div className="flex items-center self-stretch gap-3">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/g9syvz03_expires_30_days.png"} 
									className="w-6 h-6 rounded-xl object-fill"
								/>
								<span className="text-[#2A2A2A] text-[15px]" >
									Verified campus counsellors trained for student struggles
								</span>
							</div>
							<div className="flex items-center self-stretch gap-3">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/v7yktw9c_expires_30_days.png"} 
									className="w-6 h-6 rounded-xl object-fill"
								/>
								<span className="text-[#2A2A2A] text-[15px]" >
									Crisis support 24/7 — immediate, zero-judgment help
								</span>
							</div>
						</div>
					</div>
					<button className="flex flex-1 flex-col items-center bg-[#F5EDE3] text-left py-[22px] mt-[220px] mb-[140px] mx-10 rounded-[260px] border-0"
						onClick={()=>alert("Pressed!")}>
						<div className="items-start bg-white w-[348px] relative pt-[50px] pl-[47px] rounded-[28px]" 
							style={{
								boxShadow: "0px 16px 32px #4A2C5E24"
							}}>
							<div className="flex flex-col items-start w-[257px] absolute top-[19px] right-[18px] gap-1.5">
								<div className="flex items-start py-[1px] gap-1.5">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/jpkvt1hj_expires_30_days.png"} 
										className="w-[9px] h-[9px] object-fill"
									/>
									<span className="text-[#4A2C5E] text-xs font-bold w-[57px]" >
										My Space
									</span>
								</div>
								<div className="flex flex-col items-end self-stretch">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/s7bsk1ta_expires_30_days.png"} 
										className="w-[18px] h-[18px] object-fill"
									/>
								</div>
							</div>
							<div className="flex flex-col items-start bg-[#F5EDE3] w-[278px] relative pt-[94px] px-[18px] mb-56 rounded-[20px]">
								<span className="text-[#4A2C5E] text-base font-bold absolute top-[17px] right-[35px] left-[35px]" >
									How&#39;s the head space today?
								</span>
								<span className="text-[#6A6865] text-xs w-[179px] absolute top-[49px] left-7" >
									Take a private second to anchor yourself.
								</span>
								<div className="flex items-start self-stretch mb-[18px]">
									<div className="w-[71px] mb-[25px] mr-1">
										<div className="flex flex-col items-start self-stretch pr-[5px]">
											<div className="flex flex-col items-center self-stretch bg-white py-[7px] ml-[5px] rounded-[999px]">
												<span className="text-[#4A2C5E] text-[11px] font-bold" >
													Anxious
												</span>
											</div>
											<div className="flex flex-col items-start bg-white py-[7px] px-[11px] rounded-[999px]">
												<span className="text-[#4A2C5E] text-[11px] font-bold" >
													Okay
												</span>
											</div>
										</div>
									</div>
									<div className="flex flex-col shrink-0 items-start bg-[#7B9E6B] py-[7px] px-[11px] mt-[9px] mr-[5px] rounded-[999px]">
										<span className="text-white text-[11px] font-bold" >
											Calm
										</span>
									</div>
									<div className="flex flex-col shrink-0 items-start bg-white py-1.5 px-[11px] mt-[17px] rounded-[999px]">
										<span className="text-[#4A2C5E] text-[11px] font-bold w-[73px]" >
											Overwhelmed
										</span>
									</div>
								</div>
							</div>
							<div className="items-start bg-white w-[270px] absolute bottom-[99px] left-[30px] py-[18px] pl-[18px] rounded-[20px] border border-solid border-[#E8E0D8]">
								<div className="flex flex-col items-start w-[195px] gap-[25px]">
									<div className="flex items-start ml-2 gap-[7px]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/r075c6ri_expires_30_days.png"} 
											className="w-1.5 h-1.5 object-fill"
										/>
										<span className="text-[#5C7A4F] text-[11px] font-bold" >
											Online now
										</span>
									</div>
									<div className="flex flex-col items-start self-stretch relative">
										<span className="text-[#4A2C5E] text-sm font-bold w-[116px] absolute top-[-26px] left-[5px]" >
											Speak with Aisha
										</span>
										<span className="text-[#6A6865] text-[11px]" >
											Specialist in academic stress &amp; career transitions.
										</span>
									</div>
								</div>
							</div>
						</div>
					</button>
				</div>
				<div className="flex flex-col self-stretch py-[100px] px-20 gap-14">
					<div className="flex flex-col items-start self-stretch gap-4">
						<span className="text-[#A04830] text-sm font-bold" >
							The Path
						</span>
						<span className="text-[#4A2C5E] text-[40px] font-bold" >
							Getting support should feel effortless
						</span>
						<span className="text-[#6A6865] text-lg" >
							Three simple steps to transition from feeling isolated to feeling heard.
						</span>
					</div>
					<div className="self-stretch">
						<div className="flex items-start self-stretch py-8">
							<span className="text-[#C45D3E] text-[32px] font-bold mr-[43px]" >
								01
							</span>
							<div className="flex flex-col shrink-0 items-start pr-[142px] mr-10">
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									Join anonymously
								</span>
							</div>
							<span className="flex-1 text-[#6A6865] text-base" >
								No real names, no email linkages to your college ID. We verify student status securely through a closed, private loop, leaving your profile entirely anonymous to others.
							</span>
						</div>
						<div className="flex items-start self-stretch py-8">
							<span className="text-[#C45D3E] text-[32px] font-bold mr-[43px]" >
								02
							</span>
							<div className="flex flex-col shrink-0 items-start pr-[72px] mr-10">
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									Select your comfort level
								</span>
							</div>
							<span className="flex-1 text-[#6A6865] text-base" >
								Check in with your mood privately, write down thoughts in a secure journal, or join themed student peer circles to read and share experiences.
							</span>
						</div>
						<div className="flex items-start self-stretch py-8">
							<span className="text-[#C45D3E] text-[32px] font-bold mr-[42px]" >
								03
							</span>
							<div className="flex flex-col shrink-0 items-start pr-6 mr-10">
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									Connect with certified guides
								</span>
							</div>
							<span className="flex-1 text-[#6A6865] text-base" >
								When you&#39;re ready, schedule audio or text sessions with professional counsellors who understand the unique realities of Indian universities.
							</span>
						</div>
					</div>
				</div>
				<div className="flex flex-col self-stretch py-[100px] px-20 gap-14">
					<div className="flex flex-col items-start self-stretch gap-4">
						<span className="text-[#A04830] text-sm font-bold" >
							Sanctuary Features
						</span>
						<span className="text-[#4A2C5E] text-[40px] font-bold" >
							Made for the college headspace
						</span>
					</div>
					<div className="flex items-center self-stretch gap-6">
						<div className="flex flex-col items-start bg-white w-[520px] pt-10 px-10 rounded-[20px]" 
							style={{
								boxShadow: "0px 8px 16px #4A2C5E0D"
							}}>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/5jnm7szv_expires_30_days.png"} 
								className="w-12 h-12 mb-6 rounded-3xl object-fill"
							/>
							<div className="flex flex-col items-start self-stretch mb-[140px] gap-2.5">
								<span className="text-[#4A2C5E] text-2xl font-bold" >
									Peer Circles
								</span>
								<span className="text-[#6A6865] text-base w-[429px]" >
									Moderated, tiny spaces to talk about exam pressure, body image, or relationship stress with peers who actually get it.
								</span>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-start py-10 pr-10 rounded-[20px]" 
							style={{
								background: "linear-gradient(180deg, #4A2C5E, #9A4A34)"
							}}>
							<div className="flex flex-col items-start self-stretch mb-[103px] ml-10 gap-3">
								<button className="flex flex-col items-start bg-[#C45D3E] text-left py-1.5 px-3 rounded-[999px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-white text-xs font-bold" >
										Secure Chat
									</span>
								</button>
								<span className="text-white text-[32px] font-bold" >
									Direct, quiet messaging with therapists
								</span>
								<span className="text-[#FFF8F0] text-base w-[623px]" >
									Book anonymous, text-based or audio consultations easily. No long forms, no waiting lists. Just continuous, empathetic campus support.
								</span>
							</div>
							<div className="flex items-center ml-10 gap-[11px]">
								<span className="text-white text-sm font-bold" >
									Schedule a confidential text session
								</span>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/u2axp6ht_expires_30_days.png"} 
									className="w-4 h-4 object-fill"
								/>
							</div>
						</div>
					</div>
					<div className="flex items-center self-stretch gap-6">
						<div className="flex flex-1 flex-col items-start bg-white py-10 pr-10 rounded-[20px]" 
							style={{
								boxShadow: "0px 8px 16px #4A2C5E0D"
							}}>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/miwmdktw_expires_30_days.png"} 
								className="w-12 h-12 mb-[104px] ml-10 rounded-3xl object-fill"
							/>
							<div className="flex flex-col items-start self-stretch ml-10 gap-2.5">
								<span className="text-[#4A2C5E] text-2xl font-bold" >
									Daily Reflections &amp; Checks
								</span>
								<span className="text-[#6A6865] text-base" >
									Quiet prompts built around the academic calendar. Pause and process before semester starts, during exam seasons, or when placements roll in.
								</span>
							</div>
						</div>
						<div className="flex flex-col items-start bg-white w-[520px] p-10 rounded-[20px]" 
							style={{
								boxShadow: "0px 8px 16px #4A2C5E0D"
							}}>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/j6g1l17q_expires_30_days.png"} 
								className="w-12 h-12 mb-20 rounded-3xl object-fill"
							/>
							<div className="flex flex-col items-start self-stretch gap-2.5">
								<span className="text-[#4A2C5E] text-2xl font-bold" >
									Uncluttered Library
								</span>
								<span className="text-[#6A6865] text-base w-[418px]" >
									No high-productivity tips. Just simple, student-validated guides on boundaries, self-compassion, and dealing with anxiety.
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex items-center self-stretch bg-[#F5EDE3] p-20">
					<div className="flex flex-1 flex-col items-start mr-20 gap-4">
						<span className="text-[#A04830] text-sm font-bold" >
							Your Safety First
						</span>
						<span className="text-[#4A2C5E] text-4xl font-bold" >
							A locked, zero-judgment room for your mind.
						</span>
						<span className="text-[#2A2A2A] text-base w-[512px]" >
							We understand how sensitive mental health is in family and university environments. That&#39;s why safety isn&#39;t a premium feature; it&#39;s our core architecture.
						</span>
					</div>
					<div className="flex flex-1 items-center gap-8">
						<div className="flex flex-col shrink-0 items-start pr-[26px] gap-3">
							<span className="text-[#4A2C5E] text-xl font-bold" >
								Complete Anonymity
							</span>
							<span className="text-[#6A6865] text-sm w-[258px]" >
								Your college only sees that a student signed up—never who. No names, IDs, or records are ever tied to chat details.
							</span>
						</div>
						<div className="flex flex-col shrink-0 items-start gap-3">
							<span className="text-[#4A2C5E] text-xl font-bold mr-[61px]" >
								Immediate Crisis Loop
							</span>
							<span className="text-[#6A6865] text-sm w-[279px]" >
								In acute distress? Access one-tap call lines to verified crisis hotlines across India instantly. Completely free.
							</span>
						</div>
					</div>
				</div>
				<div className="flex flex-col self-stretch py-[100px] px-20 gap-14">
					<div className="flex flex-col items-center self-stretch gap-4">
						<span className="text-[#A04830] text-sm font-bold" >
							Our Care Team
						</span>
						<span className="text-[#4A2C5E] text-[40px] font-bold" >
							Gentle, qualified minds ready to listen
						</span>
						<span className="text-[#6A6865] text-lg" >
							All counsellors are verified experts specializing in modern youth and student development struggles.
						</span>
					</div>
					<div className="flex items-center self-stretch gap-10">
						<div className="flex flex-1 flex-col items-center bg-white py-6 gap-5 rounded-[20px]" 
							style={{
								boxShadow: "0px 4px 12px #4A2C5E0D"
							}}>
							<button className="flex flex-col items-start bg-[#4A2C5E] text-left py-[22px] px-[23px] rounded-[40px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-[28px] font-bold" >
									AI
								</span>
							</button>
							<div className="flex flex-col items-center self-stretch mx-6 gap-2">
								<span className="text-[#4A2C5E] text-xl font-bold" >
									Dr. Ananya Iyer
								</span>
								<span className="text-[#6A6865] text-sm text-center mx-0.5" >
									Ph.D. in Youth Counseling, expert in academic burnout &amp; familial expectations.
								</span>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-center bg-white py-6 gap-5 rounded-[20px]" 
							style={{
								boxShadow: "0px 4px 12px #4A2C5E0D"
							}}>
							<button className="flex flex-col items-start bg-[#C45D3E] text-left py-[22px] px-5 rounded-[40px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-[28px] font-bold" >
									RS
								</span>
							</button>
							<div className="flex flex-col items-center self-stretch mx-6 gap-2">
								<span className="text-[#4A2C5E] text-xl font-bold" >
									Counsellor Rahul Sen
								</span>
								<span className="text-[#6A6865] text-sm text-center mx-[11px]" >
									M.Sc. Clinical Psychology, specializes in relationship adjustments &amp; identity.
								</span>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-center bg-white py-6 gap-5 rounded-[20px]" 
							style={{
								boxShadow: "0px 4px 12px #4A2C5E0D"
							}}>
							<button className="flex flex-col items-start bg-[#7B9E6B] text-left py-[22px] px-[17px] rounded-[40px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-[28px] font-bold" >
									MF
								</span>
							</button>
							<div className="flex flex-col items-center self-stretch mx-6 gap-2">
								<span className="text-[#4A2C5E] text-xl font-bold" >
									Meera Fernandez
								</span>
								<span className="text-[#6A6865] text-sm text-center mx-[7px]" >
									Behavioral therapist focused on adjustment stress &amp; performance anxiety.
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col self-stretch py-[100px] px-20 gap-14">
					<div className="flex flex-col items-start self-stretch gap-4">
						<span className="text-[#A04830] text-sm font-bold" >
							Shared Journeys
						</span>
						<span className="text-[#4A2C5E] text-[40px] font-bold" >
							Real voices from Indian campuses
						</span>
					</div>
					<div className="flex items-start self-stretch">
						<div className="flex flex-1 flex-col items-start mr-20 gap-6">
							<span className="text-[#4A2C5E] text-2xl w-[589px]" >
								“Between prep for CAT and family pressure about placements, I felt paralyzed. Journaling anonymously on MindCircle was the first time I could say &#39;I&#39;m scared&#39; without feeling like a failure. Hearing from others in the same boat kept me anchored.”
							</span>
							<div className="flex items-center gap-3">
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-3.5 rounded-[20px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#4A2C5E] text-base font-bold" >
										B
									</span>
								</button>
								<div className="flex flex-col shrink-0 items-start gap-0.5">
									<span className="text-[#2A2A2A] text-[15px] font-bold" >
										Final Year B.Tech Student
									</span>
									<span className="text-[#80698A] text-[13px] mr-[124px]" >
										Bengaluru
									</span>
								</div>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-start gap-6">
							<span className="text-[#4A2C5E] text-2xl w-[584px]" >
								“Finding a therapist who gets what it&#39;s like to live in a hostel with five other guys is hard. Rahul, my counsellor here, didn&#39;t give me generic advice. He just listened and helped me set real boundaries.”
							</span>
							<div className="flex items-center gap-3">
								<button className="flex flex-col shrink-0 items-start bg-[#F5EDE3] text-left py-2.5 px-[13px] rounded-[20px] border-0"
									onClick={()=>alert("Pressed!")}>
									<span className="text-[#4A2C5E] text-base font-bold" >
										D
									</span>
								</button>
								<div className="flex flex-col shrink-0 items-start gap-0.5">
									<span className="text-[#2A2A2A] text-[15px] font-bold" >
										Second Year Design Student
									</span>
									<span className="text-[#80698A] text-[13px] mr-[178px]" >
										Delhi
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col items-center self-stretch py-[100px]">
					<div className="flex flex-col items-center w-[800px] gap-9">
						<div className="flex flex-col items-center self-stretch gap-4">
							<span className="text-[#A04830] text-sm font-bold" >
								Take a breath
							</span>
							<span className="text-[#4A2C5E] text-5xl font-bold" >
								You don&#39;t have to carry it all alone
							</span>
							<span className="text-[#6A6865] text-lg text-center mx-[13px]" >
								Join MindCircle today. Claim your anonymous space, connect with peers, or schedule a warm session with our counselling team.
							</span>
						</div>
						<div className="flex items-center gap-[15px]">
							<button className="flex flex-col shrink-0 items-start bg-[#4A2C5E] text-left py-3.5 px-[27px] rounded-[999px] border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-white text-base font-bold" >
									Create free anonymous account
								</span>
							</button>
							<button className="flex flex-col shrink-0 items-start bg-transparent text-left py-3.5 px-6 rounded-[999px] border border-solid border-[#4A2C5E]"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#4A2C5E] text-base font-bold" >
									Talk to support
								</span>
							</button>
						</div>
					</div>
				</div>
				<div className="self-stretch bg-[#F5EDE3] pt-20 px-20">
					<div className="flex items-start self-stretch mb-12">
						<div className="flex flex-col items-start w-[400px] mr-20 gap-5">
							<div className="flex items-center gap-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/hoi8dkyn_expires_30_days.png"} 
									className="w-8 h-8 rounded-2xl object-fill"
								/>
								<span className="text-[#4A2C5E] text-[22px] font-bold" >
									MindCircle
								</span>
							</div>
							<span className="text-[#6A6865] text-sm" >
								A private, non-clinical space tailored for Indian college minds. Designed to ease campus anxieties and build student resilience together.
							</span>
						</div>
						<div className="flex flex-1 items-start gap-16">
							<div className="flex flex-1 flex-col items-start gap-4">
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Product
								</span>
								<div className="flex flex-col items-start self-stretch gap-3">
									<span className="text-[#6A6865] text-sm" >
										Circles
									</span>
									<span className="text-[#6A6865] text-sm" >
										Counseling
									</span>
									<span className="text-[#6A6865] text-sm" >
										Journaling
									</span>
									<span className="text-[#6A6865] text-sm" >
										Privacy Setup
									</span>
								</div>
							</div>
							<div className="flex flex-1 flex-col items-start gap-4">
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Support
								</span>
								<div className="flex flex-col items-start self-stretch gap-3">
									<span className="text-[#6A6865] text-sm" >
										FAQs
									</span>
									<span className="text-[#6A6865] text-sm" >
										Campus partners
									</span>
									<span className="text-[#6A6865] text-sm" >
										Helplines
									</span>
									<span className="text-[#6A6865] text-sm" >
										Talk to Us
									</span>
								</div>
							</div>
							<div className="flex flex-1 flex-col items-start gap-4">
								<span className="text-[#4A2C5E] text-sm font-bold" >
									Legal
								</span>
								<div className="flex flex-col items-start self-stretch gap-3">
									<span className="text-[#6A6865] text-sm" >
										Privacy Policy
									</span>
									<span className="text-[#6A6865] text-sm" >
										Terms of Use
									</span>
									<span className="text-[#6A6865] text-sm" >
										Student Verification Security
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="flex flex-col self-stretch mb-10 gap-[23px]">
						<div className="self-stretch bg-[#E8E0D8] h-[1px]">
						</div>
						<div className="flex justify-between items-center self-stretch">
							<span className="text-[#80698A] text-xs" >
								© 2026 MindCircle. All rights reserved.
							</span>
							<span className="text-[#A04830] text-xs font-bold text-right w-[465px]" >
								MindCircle is not a substitute for professional care. If you are experiencing acute distress, please reach out to immediate emergency helplines.
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}