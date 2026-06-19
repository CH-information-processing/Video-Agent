import svgPaths from "./svg-bivcp8bomw";
import imgImage from "./786ce0bf8fa0b43b580f41d50abf9d3e800b3379.png";

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden className="absolute border-b-2 border-black border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-black tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Study Notes</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Knowledge Graph</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="relative shrink-0" data-name="Nav">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <Link />
        <Link1 />
      </div>
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
    <div className="absolute right-[12px] size-[10.5px] top-[6px]" data-name="Container">
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
    <div className="content-stretch flex gap-[7.99px] items-center relative shrink-0" data-name="Container">
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
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container1 />
        <Container4 />
        <Margin />
        <Container5 />
      </div>
    </div>
  );
}

function HeaderTopNavBarHorizontalAnchor() {
  return (
    <div className="bg-[#f7f9fb] h-[64px] relative shrink-0 w-full z-[2]" data-name="Header - TopNavBar (Horizontal Anchor)">
      <div aria-hidden className="absolute border-[#c6c6cd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-px px-[24px] relative size-full">
          <Nav />
          <Container />
        </div>
      </div>
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
    <div className="absolute bg-[rgba(57,128,244,0.9)] content-stretch flex items-center justify-center left-[364px] rounded-[12px] size-[80px] top-[187.25px]" data-name="Button">
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
    <div className="bg-white content-stretch flex flex-col items-center justify-center pl-[73.38px] pr-[73.39px] py-[25px] relative rounded-[8px] shrink-0" data-name="Button">
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
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Load Knowledge Base</p>
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
    <div className="bg-white content-stretch flex flex-col items-center justify-center pl-[53.81px] pr-[53.83px] py-[25px] relative rounded-[8px] shrink-0" data-name="Button">
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
    <div className="bg-[#3980f4] content-stretch flex flex-col items-center justify-center pl-[72.55px] pr-[72.56px] py-[25px] relative rounded-[8px] shrink-0" data-name="Button">
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
    <div className="absolute bg-[#f7f9fb] content-stretch flex flex-col inset-[0_360px_0_64px] isolate items-start" data-name="Center Main Content">
      <HeaderTopNavBarHorizontalAnchor />
      <VideoContentArea />
    </div>
  );
}

function Container31() {
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

function Button8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[2px] shrink-0" data-name="Button">
      <Container31 />
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center p-[24px] relative size-full">
          <Button8 />
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="-translate-y-1/2 absolute h-[24px] left-[12px] top-1/2 w-[24.03px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.03 24">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container32 />
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="-translate-y-1/2 absolute h-[24px] left-[12px] top-1/2 w-[24.03px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.03 24">
        <g id="Container">
          <path d={svgPaths.p2816f2c0} fill="var(--fill-0, #515F74)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link3() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container33 />
      </div>
    </div>
  );
}

function FooterTabs() {
  return (
    <div className="relative shrink-0 w-full" data-name="Footer Tabs">
      <div aria-hidden className="absolute border-[#c6c6cd] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[64px] pt-[17px] px-[16px] relative size-full">
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function FooterTabsMargin() {
  return (
    <div className="flex-[1_0_0] min-h-[161px] relative w-full" data-name="Footer Tabs:margin">
      <div className="flex flex-col justify-end min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-end min-h-[inherit] pt-[782.828px] relative size-full">
          <FooterTabs />
        </div>
      </div>
    </div>
  );
}

function AsideLeftSidebarSideNavBar() {
  return (
    <div className="absolute bg-[#f7f9fb] bottom-0 content-stretch flex flex-col gap-[0.002px] items-start left-0 pr-px top-0 w-[64px]" data-name="Aside - Left Sidebar (SideNavBar)">
      <div aria-hidden className="absolute border-[#c6c6cd] border-r border-solid inset-0 pointer-events-none" />
      <Header />
      <FooterTabsMargin />
    </div>
  );
}

function Container35() {
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

function Button9() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center pb-[2px] px-[8px] relative shrink-0" data-name="Button">
      <div aria-hidden className="absolute border-b-2 border-black border-solid inset-0 pointer-events-none" />
      <Container35 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Study Notes</p>
      </div>
    </div>
  );
}

function Container36() {
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

function Button10() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center px-[8px] relative shrink-0" data-name="Button">
      <Container36 />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#515f74] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Graph</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-full relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative size-full">
        <Button9 />
        <Button10 />
      </div>
    </div>
  );
}

function Container37() {
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

function Button11() {
  return (
    <div className="relative rounded-[2px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[4px] relative size-full">
        <Container37 />
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
          <Container34 />
          <Button11 />
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

function Background() {
  return (
    <div className="absolute bg-[#d5e3fd] h-[17px] left-[99.64px] rounded-[2px] top-[32.75px] w-[120.38px]" data-name="Background">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[4px] not-italic text-[#57657b] text-[14px] top-[8.5px] whitespace-nowrap">
        <p className="leading-[22.75px]">Backpropagation</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[99px] relative shrink-0 w-full" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#515f74] text-[14px] top-[29.88px] whitespace-nowrap">
        <p className="leading-[22.75px] mb-0">{`Today's session focuses on the mathematical`}</p>
        <p className="leading-[22.75px]">{`foundations of `}</p>
      </div>
      <Background />
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

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">•</p>
      </div>
    </div>
  );
}

function Container40() {
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
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3980f4] text-[14px] whitespace-nowrap">
        <p className="leading-[22px]">•</p>
      </div>
    </div>
  );
}

function Container42() {
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
      <Container41 />
      <Container42 />
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

function Container43() {
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

function Container44() {
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
        <Container43 />
        <Container44 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#515f74] text-[12px] tracking-[0.6px] whitespace-nowrap">
        <p className="leading-[16px]">Relationship Map</p>
      </div>
    </div>
  );
}

function Container47() {
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

function Container45() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Container46 />
        <Container47 />
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

function BackgroundBorder() {
  return (
    <div className="absolute bg-white content-stretch flex h-[48px] items-center justify-center left-1/4 p-px right-[57.67%] rounded-[2px] top-[96px]" data-name="Background+Border">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black text-center whitespace-nowrap">
        <p className="leading-[22px]">Relu</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-white content-stretch flex h-[48px] items-center justify-center left-[57.67%] p-px right-1/4 rounded-[2px] top-[96px]" data-name="Background+Border">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[2px]" />
      <div className="[word-break:break-word] flex flex-col font-['Inter:Regular',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black text-center whitespace-nowrap">
        <p className="leading-[22px]">Sigmoid</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
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
        <BackgroundBorder />
        <BackgroundBorder1 />
        <BackgroundBorder2 />
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
        <Container45 />
        <MockupGraph />
      </div>
    </div>
  );
}

function ArticleMarkdownNoteContent() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Article - Markdown Note Content">
      <Heading1 />
      <Container38 />
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

function Container48() {
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
          <Container48 />
        </div>
      </div>
    </div>
  );
}

function Container49() {
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

function Button12() {
  return (
    <div className="bg-black relative rounded-[6px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[6px] pt-[8.17px] px-[6px] relative size-full">
        <Container49 />
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="bg-[#eceef0] relative rounded-[4px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden className="absolute border border-[#c6c6cd] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center p-[9px] relative size-full">
          <Input1 />
          <Button12 />
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
        <BackgroundBorder3 />
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

function Container50() {
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
      <Container50 />
      <div className="absolute bg-[#3980f4] inset-0 opacity-20 rounded-[12px]" data-name="Background" />
    </div>
  );
}

export default function VideoScholarLeftSidebarCollapsed() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(247, 249, 251) 0%, rgb(247, 249, 251) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="VideoScholar - Left Sidebar Collapsed">
      <AppShell />
      <FloatingAiAssistantButton />
    </div>
  );
}