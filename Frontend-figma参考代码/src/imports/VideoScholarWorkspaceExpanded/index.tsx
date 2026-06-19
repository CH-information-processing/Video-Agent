import svgPaths from "./svg-yc867omrgs";
import imgImage from "./786ce0bf8fa0b43b580f41d50abf9d3e800b3379.png";
import imgAb6AXuBUmHUgZo5Q77Ldque90B8DAvjXaXlo4PJnIOf1MYHq45RA2HdYoI4SrKjR25NuJvbAy5IeRscW0RLdRya58QbYkf4I3ZQbVvQvGqLkB0EHb4VV1VvaiLhvV5T7HFjksNimNdPsLrKcFDarliU62UlTOcrNn5KLkXbHrVhHGjvJuE8TeCvJiBSuN4XhdrSwMriet1SiuBhL4JahRvIe0OuJqFSy8D9T1BYhcOmsG5EZh6RK5Eo5DgqgswBYew0SkE2NlDvUJr9 from "./fcb0a3c48ac3f5d40edf3ba23dbcee457fee06d0.png";

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden className="absolute border-b-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-black tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px] mb-0">Study</p>
        <p className="leading-[16px]">Notes</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px] mb-0">Knowledge</p>
        <p className="leading-[16px]">Graph</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[24px] items-center left-[24px] top-[calc(50%-0.5px)]" data-name="Nav">
      <Link />
      <Link1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
          <p className="leading-[normal]">Search knowledge base...</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#eceef0] relative rounded-[12px] shrink-0 w-[256px]" data-name="Input">
      <div className="content-stretch flex items-start justify-center overflow-clip pb-[8px] pt-[7px] px-[17px] relative rounded-[inherit] size-full">
        <Container2 />
      </div>
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute right-[11.99px] size-[10.5px] top-[6px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p210dd580} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Input />
      <Container3 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[36px] relative shrink-0 w-[32px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 36">
        <g id="Button">
          <path d={svgPaths.p121cc980} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[32px] relative shrink-0 w-[38px]" data-name="Button">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 32">
        <g id="Button">
          <path d={svgPaths.p6632200} fill="var(--fill-0, #3980F4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start px-[8px] relative shrink-0 w-[17px]" data-name="Margin">
      <div className="bg-[#c6c6cd] h-[32px] relative shrink-0 w-px" data-name="Vertical Divider" />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-black content-stretch flex flex-col items-center justify-center px-[16px] py-[9px] relative rounded-[4px] shrink-0" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-center text-white tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Summarize</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[17px] py-[9px] relative rounded-[4px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-black text-center tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Export</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[8.01px] items-start relative shrink-0" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[16px] items-center left-[154.67px] top-[calc(50%-0.5px)]" data-name="Container">
      <Container1 />
      <Container4 />
      <Margin />
      <Container5 />
    </div>
  );
}

function HeaderTopNavBarHorizontalAnchor() {
  return (
    <div className="bg-[#f7f9fb] h-[64px] relative shrink-0 w-full z-[2]" data-name="Header - TopNavBar (Horizontal Anchor)">
      <div aria-hidden className="absolute border-[#c6c6cd] border-b border-solid inset-0 pointer-events-none" />
      <Nav />
      <Container />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">STANFORD CS231N</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[7px] relative shrink-0 w-[4.317px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.31667 7">
        <g id="Container">
          <path d={svgPaths.p35022f90} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[-0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">MACHINE LEARNING MODULE</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-black tracking-[-0.75px] w-full">
        <p className="leading-[38px]">Deep Learning Fundamentals - Lecture 1</p>
      </div>
    </div>
  );
}

function TitleAndBreadcrumbs() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Title and Breadcrumbs">
      <Container6 />
      <Heading />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[28px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 28">
        <g id="Container">
          <path d="M0 28V0L22 14L0 28V28" fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[rgba(57,128,244,0.9)] content-stretch flex items-center justify-center left-[256px] rounded-[12px] size-[80px] top-[126.5px]" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[80px] top-0" data-name="Button:shadow" />
      <Container11 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex inset-0 items-center justify-center" data-name="Container">
      <div className="flex-[1_0_0] h-full min-w-px opacity-60 relative" data-name="Image">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[177.78%] left-0 max-w-none top-[-38.89%] w-full" src={imgImage} />
        </div>
      </div>
      <Button4 />
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] h-[4px] overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Progress Bar">
      <div className="absolute bg-[#3980f4] inset-[0_58%_0_0]" data-name="Background" />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 12">
        <g id="Container">
          <path d={svgPaths.p2ee7f2e0} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[14px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
        <g id="Container">
          <path d={svgPaths.p35528880} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 12">
        <g id="Container">
          <path d={svgPaths.p6f94780} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">12:45 / 48:20</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Container14 />
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 9.33333">
        <g id="Container">
          <path d={svgPaths.p368ee100} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[11.667px] relative shrink-0 w-[11.725px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.725 11.6667">
        <g id="Container">
          <path d={svgPaths.p1a3bd300} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p230e6200} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Container19 />
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container18 />
    </div>
  );
}

function CustomPlayerUi() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[8px] items-start left-0 p-[16px] right-0" data-name="Custom Player UI">
      <ProgressBar />
      <Container12 />
    </div>
  );
}

function VideoPlayerPlaceholder() {
  return (
    <div className="aspect-video bg-[#131b2e] overflow-clip relative rounded-[8px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Video Player Placeholder">
      <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.6)] inset-0 to-[rgba(0,0,0,0)]" data-name="Overlay Graphics" />
      <Container10 />
      <CustomPlayerUi />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[20px] relative shrink-0 w-[27.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.5 20">
        <g id="Container">
          <path d={svgPaths.p41969c0} fill="var(--fill-0, #3980F4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Container22 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Check Cache</p>
        </div>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[10px] text-center uppercase whitespace-nowrap">
          <p className="leading-[22px]">LAST SYNCED 2M AGO</p>
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center pl-[37.38px] pr-[37.39px] py-[35px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Margin1 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 size-[22.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 22.5">
        <g id="Container">
          <path d={svgPaths.pe46afb0} fill="var(--fill-0, #3980F4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative size-full">
        <Container25 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pl-[11.26px] pr-[11.27px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px] mb-0">Load Knowledge</p>
          <p className="leading-[20px]">Base</p>
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[10px] text-center uppercase whitespace-nowrap">
          <p className="leading-[22px]">124 VECTORS INDEXED</p>
        </div>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center p-[25px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Margin2 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[25px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 25">
        <g id="Container">
          <path d={svgPaths.p17359280} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0" data-name="Margin">
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px]">Start Processing</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#001a42] text-[10px] text-center uppercase whitespace-nowrap">
        <p className="leading-[22px]">ESTIMATE: 45S</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#3980f4] content-stretch flex flex-col items-center justify-center px-[36.56px] py-[35px] relative rounded-[8px] shrink-0" data-name="Button">
      <Margin3 />
      <Container29 />
      <Container30 />
    </div>
  );
}

function PrimaryActionBento() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Primary Action Bento">
      <Button5 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function VideoContentArea() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full z-[1]" data-name="Video Content Area">
      <div className="overflow-auto rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
          <TitleAndBreadcrumbs />
          <VideoPlayerPlaceholder />
          <PrimaryActionBento />
        </div>
      </div>
    </div>
  );
}

function CenterMainContent() {
  return (
    <div className="absolute bg-[#f7f9fb] content-stretch flex flex-col inset-[0_360px_0_280px] isolate items-start" data-name="Center Main Content">
      <HeaderTopNavBarHorizontalAnchor />
      <VideoContentArea />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black whitespace-nowrap">
        <p className="leading-[28px]">VideoScholar</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">ACADEMIC MODE</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[131.91px]" data-name="Container">
      <Container32 />
      <Container33 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[12px] relative shrink-0 w-[14px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 12">
        <g id="Container">
          <path d={svgPaths.p3ee89540} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[2px] shrink-0" data-name="Button">
      <Container34 />
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between p-[24px] relative size-full">
          <Container31 />
          <Button8 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Container">
          <path d={svgPaths.p2bb32400} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[22px]">New Analysis</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-black relative rounded-[4px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[12px] relative size-full">
          <Container35 />
          <Container36 />
        </div>
      </div>
    </div>
  );
}

function NewAnalysisCta() {
  return (
    <div className="relative shrink-0 w-full" data-name="New Analysis CTA">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[16px] px-[24px] relative size-full">
        <Button9 />
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pb-[8px] px-[8px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(69,70,77,0.6)] tracking-[0.6px] uppercase w-full">
          <p className="leading-[16px]">PRIMARY</p>
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p20793584} fill="var(--fill-0, #3980F4)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[14px] whitespace-nowrap">
          <p className="leading-[22px]">Dashboard</p>
        </div>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-[#f2f4f6] relative rounded-br-[2px] rounded-tr-[2px] shrink-0 w-full" data-name="Link">
      <div aria-hidden className="absolute border-[#3980f4] border-l-4 border-solid inset-0 pointer-events-none rounded-br-[2px] rounded-tr-[2px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[16px] pr-[12px] py-[8px] relative size-full">
          <Container39 />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p3e330400} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">Library</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
          <Container41 />
          <Container42 />
        </div>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.pc679c40} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">Transcripts</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
          <Container43 />
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start py-[8px] relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function Container45() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] px-[8px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(69,70,77,0.6)] tracking-[0.6px] uppercase w-full">
          <p className="leading-[16px]">CACHE STATUS</p>
        </div>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 9.33333">
        <g id="Container">
          <path d={svgPaths.p5390400} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container49 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Subtitles</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">100%</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container48 />
      <Container50 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e0e3e5] content-stretch flex flex-col h-[4px] items-start justify-center overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Background">
      <div className="bg-[#3980f4] flex-[1_0_0] min-h-px relative w-full" data-name="Background" />
    </div>
  );
}

function Container53() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p7f78400} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container53 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Keyframes</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">85%</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container52 />
      <Container54 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#e0e3e5] h-[4px] overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#3980f4] inset-[0_20%_0_0]" data-name="Background" />
    </div>
  );
}

function Container57() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p3d515a00} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container57 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">RAG Index</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#b9c7e0] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">Ready</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container56 />
      <Container58 />
    </div>
  );
}

function Container46() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start px-[8px] relative size-full">
        <Container47 />
        <Background />
        <Container51 />
        <Background1 />
        <Container55 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] pt-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[#c6c6cd] border-solid border-t inset-0 pointer-events-none" />
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container60() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p3cf2be00} fill="var(--fill-0, #57657B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#57657b] text-[12px] tracking-[-0.3px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">STATUS</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container60 />
        <Container61 />
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#57657b] text-[12px] w-full">
          <p className="leading-[16px]">{`Ready for Q&A Analysis`}</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#d5e3fd] relative rounded-[4px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden className="absolute border border-[rgba(87,101,123,0.2)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start p-[13px] relative size-full">
        <Container59 />
        <Container62 />
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] pt-[17px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[#c6c6cd] border-solid border-t inset-0 pointer-events-none" />
      <BackgroundBorder />
    </div>
  );
}

function NavigationLinks() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Navigation Links">
      <div className="overflow-auto rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start px-[16px] relative size-full">
          <Container37 />
          <HorizontalBorder />
          <HorizontalBorder1 />
        </div>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">Settings</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
          <Container63 />
          <Container64 />
        </div>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p2816f2c0} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">Help</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
          <Container65 />
          <Container66 />
        </div>
      </div>
    </div>
  );
}

function Ab6AXuBUmHUgZo5Q77Ldque90B8DAvjXaXlo4PJnIOf1MYHq45RA2HdYoI4SrKjR25NuJvbAy5IeRscW0RLdRya58QbYkf4I3ZQbVvQvGqLkB0EHb4VV1VvaiLhvV5T7HFjksNimNdPsLrKcFDarliU62UlTOcrNn5KLkXbHrVhHGjvJuE8TeCvJiBSuN4XhdrSwMriet1SiuBhL4JahRvIe0OuJqFSy8D9T1BYhcOmsG5EZh6RK5Eo5DgqgswBYew0SkE2NlDvUJr() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="AB6AXuBUmHUgZO5Q77LDQUE90B8DAvjXa_Xlo4PJnIOf1mYHq45R-a_2HDYoI4srKjR25NuJVBAy5ieRscW0rLDRya58qbYkf4i3ZQbVvQVGqLkB0EHb4vV1VvaiLhvV5t7HFjksNimNDPsLRKcFDarliU62UlTOcrNn5kLKXbHrVhHGjvJuE8TeCVJiBSu_N4XhdrSwMRIET1SIUBhL4JahRVIe0OuJqFSy_8d9t1bYhcOmsG5EZh6rK5eo5dgqgswBYew0skE2NlDvUJr9">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuBUmHUgZo5Q77Ldque90B8DAvjXaXlo4PJnIOf1MYHq45RA2HdYoI4SrKjR25NuJvbAy5IeRscW0RLdRya58QbYkf4I3ZQbVvQvGqLkB0EHb4VV1VvaiLhvV5T7HFjksNimNdPsLrKcFDarliU62UlTOcrNn5KLkXbHrVhHGjvJuE8TeCvJiBSuN4XhdrSwMriet1SiuBhL4JahRvIe0OuJqFSy8D9T1BYhcOmsG5EZh6RK5Eo5DgqgswBYew0SkE2NlDvUJr9} />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#c6c6cd] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[12px] shrink-0 size-[32px]" data-name="Background">
      <Ab6AXuBUmHUgZo5Q77Ldque90B8DAvjXaXlo4PJnIOf1MYHq45RA2HdYoI4SrKjR25NuJvbAy5IeRscW0RLdRya58QbYkf4I3ZQbVvQvGqLkB0EHb4VV1VvaiLhvV5T7HFjksNimNdPsLrKcFDarliU62UlTOcrNn5KLkXbHrVhHGjvJuE8TeCvJiBSuN4XhdrSwMriet1SiuBhL4JahRvIe0OuJqFSy8D9T1BYhcOmsG5EZh6RK5Eo5DgqgswBYew0SkE2NlDvUJr />
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black whitespace-nowrap">
        <p className="leading-[16px]">Dr. Sarah Chen</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[10px] tracking-[1px] uppercase whitespace-nowrap">
        <p className="leading-[22px]">PREMIUM PLAN</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[88.33px]" data-name="Container">
      <Container69 />
      <Container70 />
    </div>
  );
}

function Container67() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center pt-[16px] px-[12px] relative size-full">
          <Background2 />
          <Container68 />
        </div>
      </div>
    </div>
  );
}

function FooterTabs() {
  return (
    <div className="relative shrink-0 w-full" data-name="Footer Tabs">
      <div aria-hidden className="absolute border-[#c6c6cd] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[16px] pt-[17px] px-[16px] relative size-full">
        <Link5 />
        <Link6 />
        <Container67 />
      </div>
    </div>
  );
}

function AsideLeftSidebarSideNavBar() {
  return (
    <div className="absolute bg-[#f7f9fb] bottom-0 content-stretch flex flex-col items-start justify-between left-0 pr-px top-0 w-[280px]" data-name="Aside - Left Sidebar (SideNavBar)">
      <div aria-hidden className="absolute border-[#c6c6cd] border-r border-solid inset-0 pointer-events-none" />
      <Header />
      <NewAnalysisCta />
      <NavigationLinks />
      <FooterTabs />
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 9.33333">
        <g id="Container">
          <path d={svgPaths.p2be32000} fill="var(--fill-0, #191C1E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center pb-[2px] px-[8px] relative shrink-0" data-name="Button">
      <div aria-hidden className="absolute border-b-2 border-black border-solid inset-0 pointer-events-none" />
      <Container72 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Study Notes</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[13.417px] relative shrink-0 w-[14px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.4167">
        <g id="Container">
          <path d={svgPaths.p33f63300} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center px-[8px] relative shrink-0" data-name="Button">
      <Container73 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Graph</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="h-full relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative size-full">
        <Button10 />
        <Button11 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="h-[12px] relative shrink-0 w-[14px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 12">
        <g id="Container">
          <path d={svgPaths.p3bf37000} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
        <Container74 />
      </div>
    </div>
  );
}

function TabsHeader() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Tabs Header">
      <div aria-hidden className="absolute border-[#c6c6cd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-px px-[16px] relative size-full">
          <Container71 />
          <Button12 />
        </div>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-black w-full">
        <p className="leading-[28px]">Lecture Summary</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="absolute bg-[#d5e3fd] h-[17px] left-[99.64px] rounded-[2px] top-[32.75px] w-[120.38px]" data-name="Background">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[#57657b] text-[14px] top-[8.5px] whitespace-nowrap">
        <p className="leading-[22.75px]">Backpropagation</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[99px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#515f74] text-[14px] top-[29.88px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">{`Today's session focuses on the mathematical`}</p>
        <p className="leading-[22.75px]">{`foundations of `}</p>
      </div>
      <Background3 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[220.02px] not-italic text-[#515f74] text-[14px] top-[41.25px] whitespace-nowrap">
        <p className="leading-[22.75px]">. Professor</p>
      </div>
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#515f74] text-[14px] top-[75.38px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">{`Fei-Fei Li highlights the chain rule's role in`}</p>
        <p className="leading-[22.75px]">gradient computation.</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pt-[15.5px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-[#3980f4] h-[16px] relative rounded-[2px] shrink-0 w-[6px]" data-name="Background" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
        <p className="leading-[22px]">Key Takeaways</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">•</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[10.3px] relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">Linear Layers act as affine transformations</p>
        <p className="leading-[22px]">followed by non-linear activations.</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex gap-[12px] h-[44px] items-start relative shrink-0 w-full" data-name="Item">
      <Container76 />
      <Container77 />
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">•</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8.39px] relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">Softmax cross-entropy is the standard loss</p>
        <p className="leading-[22px]">for multi-class classification.</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex gap-[12px] h-[44px] items-start relative shrink-0 w-full" data-name="Item">
      <Container78 />
      <Container79 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
    </div>
  );
}

function Container80() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#3980f4] text-[10px] w-full">
          <p className="leading-[22px]">TRANSCRIPT CITATION @ 12:04</p>
        </div>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[#515f74] text-[14px] w-full">
          <p className="leading-[20px] mb-0">{`"The gradient is essentially a vector of`}</p>
          <p className="leading-[20px] mb-0">partial derivatives that points in the</p>
          <p className="leading-[20px]">{`direction of steepest increase."`}</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundVerticalBorder() {
  return (
    <div className="bg-[#f7f9fb] relative rounded-[2px] shrink-0 w-full" data-name="Background+VerticalBorder">
      <div aria-hidden className="absolute border-[#3980f4] border-l-4 border-solid inset-0 pointer-events-none rounded-[2px]" />
      <div className="content-stretch flex flex-col gap-[4px] items-start pl-[20px] pr-[16px] py-[16px] relative size-full">
        <Container80 />
        <Container81 />
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Relationship Map</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p14eb9c00} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container82() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container83 />
        <Container84 />
      </div>
    </div>
  );
}

function VisualPlaceholderOfAGraph() {
  return (
    <div className="-translate-x-1/2 absolute bg-black content-stretch flex items-center justify-center left-1/2 p-px rounded-[2px] size-[48px] top-[16px]" data-name="Visual placeholder of a graph">
      <div aria-hidden className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[22px]">L1</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-white content-stretch flex h-[48px] items-center justify-center left-1/4 p-px right-[57.67%] rounded-[2px] top-[96px]" data-name="Background+Border">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black text-center whitespace-nowrap">
        <p className="leading-[22px]">Relu</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="absolute bg-white content-stretch flex h-[48px] items-center justify-center left-[57.67%] p-px right-1/4 rounded-[2px] top-[96px]" data-name="Background+Border">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black text-center whitespace-nowrap">
        <p className="leading-[22px]">Sigmoid</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#3980f4] bottom-[16px] content-stretch flex items-center justify-center left-1/2 p-px rounded-[2px] size-[48px]" data-name="Background+Border">
      <div aria-hidden className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[22px]">Loss</p>
      </div>
    </div>
  );
}

function MockupGraph() {
  return (
    <div className="h-[192px] relative shrink-0 w-full" data-name="Mockup Graph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <VisualPlaceholderOfAGraph />
        <BackgroundBorder1 />
        <BackgroundBorder2 />
        <BackgroundBorder3 />
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 277 192">
          <g id="SVG">
            <g id="Vector">
              <path d={svgPaths.p1c13cc80} fill="var(--fill-0, black)" />
              <path d={svgPaths.p1c13cc80} stroke="var(--stroke-0, #76777D)" strokeDasharray="4" />
            </g>
            <g id="Vector_2">
              <path d={svgPaths.p26a4d000} fill="var(--fill-0, black)" />
              <path d={svgPaths.p26a4d000} stroke="var(--stroke-0, #76777D)" strokeDasharray="4" />
            </g>
            <g id="Vector_3">
              <path d={svgPaths.p35185000} fill="var(--fill-0, black)" />
              <path d={svgPaths.p35185000} stroke="var(--stroke-0, #76777D)" />
            </g>
            <g id="Vector_4">
              <path d={svgPaths.p20f60560} fill="var(--fill-0, black)" />
              <path d={svgPaths.p20f60560} stroke="var(--stroke-0, #76777D)" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function KnowledgeGraphPlaceholderMermaidStyle() {
  return (
    <div className="bg-[#f7f9fb] relative rounded-[4px] shrink-0 w-full" data-name="Knowledge Graph Placeholder (Mermaid-style)">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[17px] pt-[41px] px-[17px] relative size-full">
        <Container82 />
        <MockupGraph />
      </div>
    </div>
  );
}

function ArticleMarkdownNoteContent() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Article - Markdown Note Content">
      <Heading1 />
      <Container75 />
      <Heading2 />
      <List />
      <BackgroundVerticalBorder />
      <KnowledgeGraphPlaceholderMermaidStyle />
    </div>
  );
}

function Content() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Content">
      <div className="overflow-auto rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[24px] relative size-full">
          <ArticleMarkdownNoteContent />
        </div>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
        <p className="leading-[normal]">Add a quick note at current timestamp...</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[9px] pt-[8px] px-[12px] relative size-full">
          <Container85 />
        </div>
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[9.333px] relative shrink-0 w-[11.083px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0833 9.33333">
        <g id="Container">
          <path d={svgPaths.pfe16e10} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="bg-black relative rounded-[6px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[6px] pt-[8.17px] px-[6px] relative size-full">
        <Container86 />
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="bg-[#eceef0] relative rounded-[4px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center p-[9px] relative size-full">
          <Input1 />
          <Button13 />
        </div>
      </div>
    </div>
  );
}

function QuickAddNote() {
  return (
    <div className="relative shrink-0 w-full" data-name="Quick Add Note">
      <div aria-hidden className="absolute border-[#c6c6cd] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[16px] pt-[17px] px-[16px] relative size-full">
        <BackgroundBorder4 />
      </div>
    </div>
  );
}

function AsideRightSidebarStudyKnowledgeShell() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col items-start left-[920px] pl-px top-0 w-[360px]" data-name="Aside - Right Sidebar (Study & Knowledge Shell)">
      <div aria-hidden className="absolute border-[#c6c6cd] border-l border-solid inset-0 pointer-events-none" />
      <TabsHeader />
      <Content />
      <QuickAddNote />
    </div>
  );
}

function AppShell() {
  return (
    <div className="h-[1024px] overflow-clip relative shrink-0 w-full" data-name="App Shell">
      <CenterMainContent />
      <AsideLeftSidebarSideNavBar />
      <AsideRightSidebarStudyKnowledgeShell />
    </div>
  );
}

function Container87() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Container">
          <path d={svgPaths.p27114680} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function FloatingAiAssistantButton() {
  return (
    <div className="absolute bg-[#3980f4] bottom-[32px] content-stretch flex items-center justify-center right-[32px] rounded-[12px] size-[56px]" data-name="Floating AI Assistant Button">
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-0 right-0 rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-[56px]" data-name="Floating AI Assistant Button:shadow" />
      <Container87 />
      <div className="absolute bg-[#3980f4] inset-0 opacity-20 rounded-[12px]" data-name="Background" />
    </div>
  );
}

export default function VideoScholarWorkspaceExpanded() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(247, 249, 251) 0%, rgb(247, 249, 251) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="VideoScholar - Workspace Expanded">
      <AppShell />
      <FloatingAiAssistantButton />
    </div>
  );
}