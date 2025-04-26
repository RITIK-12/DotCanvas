import React, { useState } from "react";
import Marquee from "react-fast-marquee";
import "@fontsource/cormorant";
import "@fontsource/montserrat";
import classNames from "classnames";

const Navitem = ["explore", "resources", "creators"];
const discover = [
  {
    price: "$278m",
    field: "Trading Volume",
  },
  {
    price: "300k",
    field: "Art Work",
  },
  {
    price: "1.8m",
    field: "Total Users",
  },
];
const dropsection = [
  {
    img: "/assets/nft/dropimg1.png",
    title1: "Knight Sword",
    subtitle: "@santosox",
    eth: "3 ETH",
  },
  {
    img: "/assets/nft/dropimg2.png",
    title1: "Daft Punk",
    subtitle: "@punix",
    eth: "2.34 ETH",
  },
  {
    img: "/assets/nft/dropimg3.png",
    title1: "Skater Girl",
    subtitle: "@inoino",
    eth: "10.5 ETH",
  },
  {
    img: "/assets/nft/dropimg4.png",
    title1: "Grogu",
    subtitle: "@alexio",
    eth: "20.5 ETH",
  },
  {
    img: "/assets/nft/dropimg5.png",
    title1: "Foodies",
    subtitle: "@animola",
    eth: "7 ETH",
  },
  {
    img: "/assets/nft/dropimg6.png",
    title1: "Friends Kawaii",
    subtitle: "@kunai",
    eth: "80 ETH",
  },
];
const sellNft = [
  {
    img: "/assets/nft/paint.png",
    title: "Create Artwork",
    desc: "Create your collection, Add social links, a description, profile & banner images, and set a secondary sales fee",
  },
  {
    img: "/assets/nft/time.png",
    title: "Add your NFTs",
    desc: "Upload your work, add a title and description, and customize your NFTs with properties, stats, and unlockable content.",
  },
  {
    img: "/assets/nft/box.png",
    title: "List them for sale",
    desc: "Choose between auctions and declining-price listings. You choose how you want to sell your NFTs, and we help you sell them!",
  },
];
const topcreator = [
  {
    img: "/assets/nft/creator1.png",
    name: "Axio Sun",
    ethe: "80224",
  },
  {
    img: "/assets/nft/creator2.png",
    name: "Gloria Wolff MD",
    ethe: "29369",
  },
  {
    img: "/assets/nft/creator3.png",
    name: "Albert Trantow",
    ethe: "53808",
  },
  {
    img: "/assets/nft/creator4.png",
    name: "Alexis Mante",
    ethe: "20123",
  },
  {
    img: "/assets/nft/creator5.png",
    name: "Cary Goldner",
    ethe: "16548",
  },
];
const topcreator1 = [
  {
    img: "/assets/nft/creator6.png",
    name: "Gregg Prosacco V",
    ethe: "24507",
  },
  {
    img: "/assets/nft/creator7.png",
    name: "Angelina Koss",
    ethe: "91031",
  },
  {
    img: "/assets/nft/creator8.png",
    name: "Axio Sun",
    ethe: "80224",
  },
  {
    img: "/assets/nft/creator2.png",
    name: "Gloria Wolff MD",
    ethe: "29369",
  },
  {
    img: "/assets/nft/creator3.png",
    name: "Albert Trantow",
    ethe: "53808",
  },
];

const Button = ({
  size,
  className,
  color,
  font,
  label,
  endIcon,
  startIcon,
  endIconClassName,
  startIconClassName,
  ...props
}) => {
  return (
    <button
      className={classNames(
        className,
        "flex justify-center items-center",
        size ? size : "",
        color ? color : "bg-blue",
        font ? font : "font-[500] tracking-tight text-[#ECDBBA]"
      )}
      {...props}
    >
      {startIcon && (
        <div className={classNames(startIconClassName || "")}>{startIcon}</div>
      )}
      <div className="relative">
        <div className="flex justify-center items-center gap-3">
          <div className="label">{label}</div>
        </div>
      </div>
      {endIcon && (
        <div className={classNames(endIconClassName || "")}>{endIcon}</div>
      )}
    </button>
  );
};

const Nft = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex text-[#ECDBBA] flex-col items-center w-full overflow-x-hidden ">
      <div className="bg-[#ECDBBA] gap-[43px] pb-10 flex flex-col items-center justify-center max-h-fit lg:h-[780px] w-full">
        <div className="px-3 relative xl:px-0 sm:px-3 py-3 flex max-w-[1180px] items-center justify-between w-full">
          <div className="cursor-pointer">
            <svg
              width="58"
              height="30"
              viewBox="0 0 58 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.88 26.88C24.44 27.7067 22.6933 28.36 20.64 28.84C18.5867 29.32 16.4533 29.56 14.24 29.56C11.2533 29.56 8.70667 29.2 6.6 28.48C4.52 27.76 2.94667 26.76 1.88 25.48C0.84 24.2 0.32 22.72 0.32 21.04C0.32 19.5733 0.72 18.28 1.52 17.16C2.32 16.04 3.42667 15.1733 4.84 14.56C3.74667 14 2.90667 13.2267 2.32 12.24C1.76 11.2267 1.48 10.12 1.48 8.92C1.48 7.37333 1.96 5.96 2.92 4.68C3.90667 3.4 5.4 2.37333 7.4 1.6C9.4 0.826665 11.8667 0.439998 14.8 0.439998C16.64 0.439998 18.4533 0.613332 20.24 0.959999C22.0267 1.30667 23.6 1.77333 24.96 2.36L22.8 8.28C20.32 7.18667 17.76 6.64 15.12 6.64C13.2267 6.64 11.8133 6.89333 10.88 7.4C9.94667 7.88 9.48 8.56 9.48 9.44C9.48 11.04 10.64 11.84 12.96 11.84H20.88V17.88H12.44C11.08 17.88 10.0533 18.1067 9.36 18.56C8.66667 18.9867 8.32 19.6267 8.32 20.48C8.32 21.3867 8.82667 22.0933 9.84 22.6C10.8533 23.1067 12.4267 23.36 14.56 23.36C16.08 23.36 17.64 23.16 19.24 22.76C20.8667 22.3333 22.28 21.76 23.48 21.04L25.88 26.88ZM29.0266 0.999998H42.2666C45.3332 0.999998 48.0532 1.57333 50.4266 2.72C52.7999 3.86667 54.6399 5.49333 55.9466 7.6C57.2532 9.70667 57.9066 12.1733 57.9066 15C57.9066 17.8267 57.2532 20.2933 55.9466 22.4C54.6399 24.5067 52.7999 26.1333 50.4266 27.28C48.0532 28.4267 45.3332 29 42.2666 29H29.0266V0.999998ZM41.9466 22.68C44.3466 22.68 46.2666 22 47.7066 20.64C49.1732 19.28 49.9066 17.4 49.9066 15C49.9066 12.6 49.1732 10.72 47.7066 9.36C46.2666 8 44.3466 7.32 41.9466 7.32H36.9466V22.68H41.9466Z"
                fill="#2D4263"
              />
              <path d="M-1 16H59.2666V18H-1V16Z" fill="#2D4263" />
            </svg>
          </div>
          <div className="hidden sm:text-lg text-2xl text-[#2D4263] font-normal md:flex md:flex-row items-center sm:gap-2.5 md:gap-[60px]">
            {Navitem.map((navitem, index) => {
              return (
                <a key={index} href="#_">
                  <div>{navitem}</div>
                </a>
              );
            })}
            <Button
              label="Connect Wallet"
              color="bg-[#2D4263]"
              className="font-Cormorant px-7 py-3 rounded-[68px] !font-bold"
              font="text-[#ECDBBA] font-normal"
            />
          </div>
          <div
            className="md:hidden cursor-pointer"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 12C3 11.5858 3.33579 11.25 3.75 11.25H20.25C20.6642 11.25 21 11.5858 21 12C21 12.4142 20.6642 12.75 20.25 12.75H3.75C3.33579 12.75 3 12.4142 3 12Z"
                fill="#2D4263"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 6C3 5.58579 3.33579 5.25 3.75 5.25H15C15.4142 5.25 15.75 5.58579 15.75 6C15.75 6.41421 15.4142 6.75 15 6.75H3.75C3.33579 6.75 3 6.41421 3 6Z"
                fill="#2D4263"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 18C3 17.5858 3.33579 17.25 3.75 17.25H15C15.4142 17.25 15.75 17.5858 15.75 18C15.75 18.4142 15.4142 18.75 15 18.75H3.75C3.33579 18.75 3 18.4142 3 18Z"
                fill="#2D4263"
              />
            </svg>
          </div>
          <div
            className={`
            " transition-all ease-in-out"
              ${
                isNavOpen
                  ? "md:hidden flex flex-col h-screen w-full left-0 top-0 absolute rounded-lg z-30 bg-[#2D4263]"
                  : "md:hidden flex flex-col h-screen w-full top-0 left-full  absolute  rounded-lg z-30 bg-[#2D4263]"
              } 
           `}
          >
            <div
              className="flex pt-5 items-center justify-end text-xl font-bold px-6 w-full"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <img
                src={"/assets/nft/closed.svg"}
                alt="Close"
                className="h-7 cursor-pointer"
              />
            </div>
            <div className="flex flex-col w-full items-center justify-center h-screen  gap-[30px] sm:gap-[50px]  md:hidden sm:text-lg text-xl  font-normal md:flex-row md:gap-[60px]">
              {Navitem.map((navitem, index) => {
                return (
                  <a key={index} href="#_">
                    <div>{navitem}</div>
                  </a>
                );
              })}
              <Button
                label="Connect Wallet"
                color="bg-[#ECDBBA]"
                className="font-Cormorant px-7 py-3 rounded-[68px] !font-bold"
                font="text-[#2D4263]"
              />
            </div>
          </div>
        </div>

        <div className=" md:flex items-center justify-between max-w-[1180px] w-full">
          <div className="text-start flex flex-col gap-2.5 sm:gap-3 md:gap-5 px-[4%] xl:px-0 md:max-w-[430px] lg:max-w-[518px] w-full ">
            <div className="text-[#2D4263] font-Cormorant text-[25px] sm:text-[40px] md:text-[50px] lg:text-[75px] md:leading-[70px] lg:leading-[87px] font-medium tracking-[0.03em]">
              Discover{" "}
              <span className="text-[#C84B31] underline">
                Rare 3D Collections
              </span>{" "}
              in the
              <span className="text-[#C84B31] underline">World</span>
            </div>
            <div className="text-[#2D4263] text-sm sm:text-xl md:text-sm font-montserrat">
              The largest 3D NFT marketplace authentic and truly unique digital
              creation. Create yout own NFT dream gallery
            </div>
            <div>
              <div className="w-full justify-between flex gap-2.5 md:gap-[30px] lg:gap-[50px] ">
                {discover.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="max-w-[150px] w-full gap-1.5 text-[#2D4263] flex flex-col text-center"
                    >
                      <div className="text-xl sm:text-3xl md:text-[32px] font-semibold leading-9">
                        {data.price}
                      </div>
                      <div className="text-[10px] sm:text-base md:text-[10px] whitespace-nowrap md:text-base font-normal tracking-[0.03em]">
                        {data.field}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              label="Join Now"
              color="bg-[#ECDBBA]"
              className="w-full text-center lg:max-w-[150px] px-7 py-3 border-2 border-[#2D4263] rounded-[68px] hover:text-white duration-1000 hover:bg-[#2D4263] !font-semibold"
              font="text-[#2D4263]"
            />
          </div>
          <div className="px-3">
            <img src={"/assets/nft/bubble.png"} alt="bubble" />
          </div>
        </div>
      </div>
      <div className="bg-[#191919] w-full flex flex-col  gap-[123px] justify-center items-center ">
        <div className="px-[4%]">
          <div className="max-w-[1180px] flex flex-col gap-[50px]  lg:gap-[123px]">
            <div className="mt-[30px] md:mt-[93px] flex flex-col gap-[50px] max-w-[1180px] justify-center w-full">
              <div className=" flex justify-between items-center">
                <div className="font-Cormorant  text-[30px] md:text-5xl font-bold leading-[58px] tracking-[0.03em]">
                  Hot Drops
                </div>
                <Button
                  label="View More"
                  className="text-xs  font-semibold text-center px-[30px] md:max-w-[166px] md:w-full py-3 border-2 border-[#ECDBBA] rounded-[68px] hover:text-white duration-1000 hover:bg-[#2D4263] hover:border-none"
                />
              </div>
              <div>
                <div className="items-center justify-center flex flex-wrap gap-[30px] md:gap-[50px] lg:gap-[83px] md:px-0 px-[3%] w-full ">
                  {dropsection.map((data, index) => {
                    return (
                      <div
                        key={index}
                        className="hover:scale-105 duration-1000 cursor-pointer flex flex-col justify-center items-center md:max-w-[300px] lg:max-w-[338px] w-full py-[4%] lg:py-[2%] max-h-fit xl:h-[410px] border-4 border-[#ECDBBA] rounded-[28px]"
                      >
                        <div className="px-[4%] w-full flex flex-col gap-4 ">
                          <img
                            src={data.img}
                            alt="dropmainback"
                            className="rounded-3xl w-full "
                          />
                          <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-[3px] items-start justify-start">
                                <div className="font-Cormorant text-[28px]  font-bold leading-[34px]">
                                  {data.title1}
                                </div>
                                <div className="font-montserrat text-sm font-normal leading-[17px]">
                                  {data.subtitle}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="font-montserrat text-sm font-bold leading-[17px]">
                                  3 ETH
                                </div>
                                <div>
                                  <img
                                    src={"/assets/nft/dropicon.svg"}
                                    alt="ethe"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="items-center flex flex-col gap-9 ">
              <div className="font-Cormorant text-[25px] sm:text-5xl  font-bold leading-[58px]">
                Create and sell your NFTs
              </div>

              <div className="cursor-pointer flex flex-wrap justify-center gap-10  xl:gap-[84px] px-[4%] lg:px-0">
                {sellNft.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="px-[17px] hover:border-1 duration-1000 hover:shadow-pupularCard hover:shadow-white w-full lg:max-w-[280px] xl:max-w-[337px] pb-[2%] max-h-fit bg-[#2D4263] border-[4px] border-[#2D4263] rounded-[28px] flex flex-col gap-2.5 items-center justify-center"
                    >
                      <div className="max-w-[200px]">
                        <img src={data.img} alt="img" />
                      </div>
                      <div className="whitespace-nowrap font-Cormorant text-[23px] sm:text-4xl  md:text-[26px] lg:text-4xl font-semibold leading-[44px]">
                        {data.title}
                      </div>
                      <div className="font-montserrat text-[15px] text-center md:text-[22px] lg:text-base  md:leading-[25px] font-normal leading-5  tracking-[0.03em]">
                        {data.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[70px]">
          <div className="text-5xl font-Cormorant leading-[58px] font-bol">
            Top Creators
          </div>
          <div className="flex  ">
            <Marquee gradient={false} pauseOnHover>
              {topcreator.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="max-w-fit flex items-center gap-[22px]"
                  >
                    <div>
                      <img src={data.img} alt="img" />
                    </div>
                    <div className="text-start flex flex-col gap-2.5">
                      <div className="whitespace-nowrap font-Cormorant text-2xl leading-[29px] tracking-[0.03em] font-semibold">
                        {data.name}
                      </div>
                      <div className="flex gap-2.5 items-center font-montserrat text-sm leading-[17px] tracking-[0.03em] font-normal">
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="26" height="26" rx="13" fill="#C84B31" />
                          <path
                            d="M13 4.33331L7.94446 13.2114L13 16.3821L18.0556 13.2114L13 4.33331ZM7.94446 14.2683L13 21.6666L18.0556 14.2683L13 17.439L7.94446 14.2683Z"
                            fill="#ECDBBA"
                          />
                        </svg>
                        {data.ethe}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Marquee>
          </div>
          <div className="flex">
            <Marquee gradient={false} speed={20} direction="right" pauseOnHover>
              {topcreator1.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="max-w-fit flex items-center gap-[22px]"
                  >
                    <div>
                      <img src={data.img} alt="imgaes" />
                    </div>
                    <div className="text-start flex flex-col gap-2.5">
                      <div className="whitespace-nowrap font-Cormorant text-2xl leading-[29px] tracking-[0.03em] font-semibold">
                        {data.name}
                      </div>
                      <div className="flex gap-2.5 items-center font-montserrat text-sm leading-[17px] tracking-[0.03em] font-normal">
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="26" height="26" rx="13" fill="#C84B31" />
                          <path
                            d="M13 4.33331L7.94446 13.2114L13 16.3821L18.0556 13.2114L13 4.33331ZM7.94446 14.2683L13 21.6666L18.0556 14.2683L13 17.439L7.94446 14.2683Z"
                            fill="#ECDBBA"
                          />
                        </svg>
                        {data.ethe}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Marquee>
          </div>
        </div>
        <div className="px-3 w-full">
          <div className="mb-[70px] flex gap-9 flex-col justify-center items-center w-full bg-[#C84B31] max-h-fit py-[3%] rounded-3xl">
            <div className="flex flex-col text-center items-center gap-[15px]">
              <div className="text-[20px] sm:text-[34px] lg:text-5xl leading-[58px] font-bold font-Cormorant tracking-[0.03em]">
                Join Our Community
              </div>
              <div className="font-montserrat tracking-[0.03em] px-2 text-[15px] md:text-xl leading-[24px] font-normal">
                Meet the company team, artist and collector for platform
                updates, announcements, and more ...
              </div>
            </div>
            <Button
              startIcon={<img src={"/assets/nft/discord.svg"} alt="discord" />}
              label="Launch Discord"
              color="bg-[#2D4263]"
              className="max-w-[252px] text-lg w-full py-3 md:py-3 flex gap-2.5 justify-center items-center rounded-[68px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className=" bg-[#191919] w-full flex justify-center pb-[30px] flex-col items-center gap-[50px]">
        <div className=" border-[5px] border-[#ECDBBA] w-full "></div>
        <div className="px-[5%] xl:px-0   flex-col flex gap-5 md:flex-row  md:gap-5  md:flex items-start justify-between max-w-[1180px] w-full">
          <div className="text-start -mt-[25px] max-w-[464px] w-full flex flex-col  gap-[11px] ">
            <a
              href="#"
              className="text-[64px] leading-[78px] font-extrabold font-montserratAlter "
            >
              ED
            </a>
            <div className="text-base leading-5 tracking-[0.03em] font-normal font-montserrat ">
              The largest 3D NFT marketplace. Authentic and truly unique digital
              creation. Signed and issued by the creator. made possible by
              blockchain technology
            </div>
          </div>
          <div className=" items-start  flex flex-col gap-2 md:gap-[21px]">
            <div className="font-Cormorant whitespace-nowrap  sm:text-2xl leading-[29px] tracking-[0.03em] font-bold">
              Quick Links
            </div>
            <div className="text-start font-montserrat text-base leading-5 tracking-[0.03em] flex flex-col gap-2.5 font-medium">
              <a href="#_"> About</a>
              <a href="#_"> Blog</a>
              <a href="#_"> Press</a>
            </div>
          </div>
          <div className="items-start  flex flex-col gap-2 md:gap-[21px]">
            <div className="font-Cormorant text-2xl leading-[29px] tracking-[0.03em] font-bold">
              Resources
            </div>
            <div className="text-start font-montserrat text-base leading-5 tracking-[0.03em] flex flex-col gap-2.5 font-medium">
              <a href="#_"> Help Center</a>
              <a href="#_"> Community</a>
              <a href="#_"> Partners</a>
            </div>
          </div>
          <div className="items-start flex flex-col gap-2 md:gap-[21px]">
            <div className="text-start font-Cormorant text-2xl leading-[29px] tracking-[0.03em] font-bold">
              Subscribe
            </div>
            <div className="font-montserrat text-base leading-5 tracking-[0.03em] flex flex-col gap-2.5 font-medium">
              <Button
                label="Get NFT updates"
                className="border whitespace-nowrap flex justify-center items-center gap-2.5 px-[24px] border-[#ECDBBA] max-w-[221px] py-[8px] rounded-[68px]"
                endIcon={
                  <img src={"/assets/nft/rightarrow.svg"} alt="get nft" />
                }
                font="font-montserrat text-base leading-5 tracking-[0.03em] font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nft;
