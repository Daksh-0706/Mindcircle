import React from "react";
export default (props) => {
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-[#FFF8F0] overflow-hidden">
				<div className="flex flex-col items-center self-stretch py-[409px] gap-4">
					<div className="flex items-center gap-3">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/dtUlyytjUr/xre6s0n1_expires_30_days.png"} 
							className="w-12 h-12 rounded-3xl object-fill"
						/>
						<span className="text-[#4A2C5E] text-[32px] font-bold" >
							MindCircle
						</span>
					</div>
					<span className="text-[#6A6865] text-sm" >
						Loading your safe space...
					</span>
				</div>
			</div>
		</div>
	)
}