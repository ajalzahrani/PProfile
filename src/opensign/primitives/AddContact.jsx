import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getTenantDetails } from "../constant/Utils";
import { emailRegex } from "../constant/const";
const AddContact = (props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addYourself, setAddYourself] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isUserExist, setIsUserExist] = useState(false);

  useEffect(() => {
    checkUserExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Load user details from localStorage when the component mounts
  useEffect(() => {
    const savedUserDetails = JSON.parse(
      localStorage.getItem("UserInformation")
    );
    if (savedUserDetails && addYourself) {
      setName(savedUserDetails.name);
      setPhone(savedUserDetails?.phone || "");
      setEmail(savedUserDetails.email);
    }
  }, [addYourself]);

  const checkUserExist = async () => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/isuserincontactbook`;
      const token = {
        "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token,
      };
      const axiosRes = await axios.post(url, {}, { headers });
      const contactRes = axiosRes?.data?.result || {};
      if (!contactRes?.objectId) {
        setIsUserExist(true);
      }
    } catch (err) {
      console.log("err ", err);
    }
  };
  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
    } else {
      setIsLoader(true);
      const user = JSON.parse(
        localStorage.getItem(
          `Parse/${localStorage.getItem("parseAppId")}/currentUser`
        )
      );
      const userId = user?.objectId || "";
      const tenantDetails = await getTenantDetails(userId);
      const tenantId = tenantDetails?.objectId || "";
      if (tenantId) {
        try {
          const baseURL = localStorage.getItem("baseUrl");
          const url = `${baseURL}functions/savecontact`;
          const token = {
            "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
          };
          const data = { name, email, phone, tenantId };
          const headers = {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            ...token,
          };
          const axiosRes = await axios.post(url, data, { headers });
          const contactRes = axiosRes?.data?.result || {};
          if (contactRes?.objectId) {
            props.details(contactRes);
            if (props.closePopup) {
              props.closePopup();
              setIsLoader(false);
              // Reset the form fields
              setAddYourself(false);
              setName("");
              setPhone("");
              setEmail("");
            }
          }
        } catch (err) {
          console.log("Err", err);
          setIsLoader(false);
          if (err?.response?.data?.error?.includes("already exists")) {
            alert(t("add-signer-alert"));
          } else {
            alert(t("something-went-wrong-mssg"));
          }
        }
      } else {
        setIsLoader(false);
        alert(t("something-went-wrong-mssg"));
      }
    }
  };

  // Define a function to handle the "add yourself" checkbox
  const handleAddYourselfChange = () => {
    if (addYourself) {
      setAddYourself(false);
      setName("");
      setPhone("");
      setEmail("");
    } else {
      setAddYourself(true);
    }
  };
  const handleReset = () => {
    setAddYourself(false);
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div className="h-full px-[20px] py-[10px]">
      {isLoader && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-20">
          <Loader />
        </div>
      )}
      <div className="w-full mx-auto p-[8px]">
        {!props?.isDisableTitle && (
          <div className="text-[14px] font-[700]">{t("add-contact")}</div>
        )}
        {isUserExist && (
          <div className="mb-[0.75rem] flex items-center mt-1">
            <input
              type="checkbox"
              id="addYourself"
              checked={addYourself}
              onChange={handleAddYourselfChange}
              className="w-4 h-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="addYourself"
              className="ml-[0.5rem] text-base-content mb-0">
              {t("add-yourself")}
            </label>
          </div>
        )}
        <form className="text-base-content" onSubmit={handleSubmit}>
          <div className="mb-[0.75rem]">
            <label htmlFor="name" className="text-[13px]">
              {t("name")}
              <span className="text-[13px] text-red-500"> *</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 w-full text-xs px-3 py-2 bg-white disabled:bg-gray-100"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="email" className="text-[13px]">
              {t("email")}
              <span className="text-[13px] text-red-500"> *</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
              }
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              required
              disabled={addYourself}
              className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 w-full text-xs px-3 py-2 bg-white lowercase disabled:bg-gray-100"
            />
          </div>
          <div className="mb-[0.75rem]">
            <label htmlFor="phone" className="text-[13px]">
              {t("phone")}
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={addYourself}
              className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 w-full text-xs px-3 py-2 bg-white disabled:bg-gray-100"
              placeholder={t("phone-optional")}
            />
          </div>

          <div className="mt-6 flex justify-start gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
              {t("submit")}
            </button>
            <button
              type="button"
              onClick={() => handleReset()}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200">
              {t("reset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;
