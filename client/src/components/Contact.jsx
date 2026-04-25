import { useNavigate } from "react-router-dom";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import {
  LAHORE_ZOO_EMAIL,
  LAHORE_ZOO_PHONE,
} from "../utils/siteConstants";

const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} alt="" className="h-full w-full object-cover" />
  </div>
);

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div id="contact" className="my-20 min-h-96 w-screen  px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">
          <ImageClipBox
            src="/img/animals/bear.jpg"
            clipClass="contact-clip-path-1"
          />
          <ImageClipBox
            src="/img/animals/animal-04.jpg"
            clipClass="contact-clip-path-2 lg:translate-y-40 translate-y-60"
          />
        </div>

        <div className="absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
          <ImageClipBox
            src="/img/animals/hippopotamus.jpg"
            clipClass="absolute md:scale-125"
          />
          <ImageClipBox
            src="/img/animals/jaguar.jpg"
            clipClass="sword-man-clip-path md:scale-125"
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase">Contact Us</p>

          <AnimatedTitle
            title="Got a Complaint?"
            className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !text-white !leading-[.9]"
          />
          <div className="contact-subtext mt-10">
            <p>Feel free to visit Director Office,</p>
            <p>
              Call us on <b className="text-green-300">{LAHORE_ZOO_PHONE}</b>
            </p>
            <p >
              Email us at
              <b className="text-yellow-300"> {LAHORE_ZOO_EMAIL}</b>
            </p>
            <p className="text-[10px] mt-5">
              You are requested to report on the spot, <br /> so we may take an
              abrupt action to resolve the issue.
            </p>
          </div>
          <Button
            title="contact us"
            containerClass="mt-5 cursor-pointer bg-white"
            accentColor="#EDFF66"
            onClick={() => navigate("/contact")}
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
