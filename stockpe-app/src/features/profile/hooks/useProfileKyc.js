import { useState, useEffect } from "react";
import {
  KYC_DETAILS_DATA,
  fetchKycDetails,
  submitPanVerification,
  submitAadhaarOtp,
} from "../services/profileService";

export function useProfileKyc() {
  const [kycData, setKycData] = useState(KYC_DETAILS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(null); // "PAN" | "AADHAAR" | "BANK" | null

  // PAN form state
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [dob, setDob] = useState("");
  const [panError, setPanError] = useState("");
  const [isSubmittingPan, setIsSubmittingPan] = useState(false);

  // Aadhaar form state
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarError, setAadhaarError] = useState("");
  const [isSubmittingAadhaar, setIsSubmittingAadhaar] = useState(false);

  // Security Toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchKycDetails().then((res) => {
      setIsLoading(false);
      if (res.success) {
        setKycData(res.data);
        setBiometricsEnabled(res.data.biometricsEnabled);
        setTwoFactorEnabled(res.data.twoFactorEnabled);
      }
    });
  }, []);

  const handleVerifyPan = async () => {
    if (!panNumber || panNumber.trim().length !== 10) {
      setPanError("Enter valid 10-digit PAN (e.g. ABCDE1234F)");
      return;
    }
    setPanError("");
    setIsSubmittingPan(true);

    const res = await submitPanVerification({
      panNumber: panNumber.trim().toUpperCase(),
      fullName: panName || "ARJUN KUMAR",
      dob,
    });

    setIsSubmittingPan(false);

    if (res.success) {
      setKycData((prev) => ({
        ...prev,
        panStatus: "VERIFIED",
        panNumberMasked: res.data.panNumberMasked,
      }));
      setActiveStep(null);
      setSuccessMessage("PAN Card Verified Successfully!");
    } else {
      setPanError(res.error || "PAN verification failed");
    }
  };

  const handleSendAadhaarOtp = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setAadhaarError("Enter valid 12-digit Aadhaar number");
      return;
    }
    setAadhaarError("");
    setOtpSent(true);
  };

  const handleVerifyAadhaar = async () => {
    if (!aadhaarOtp || aadhaarOtp.length !== 6) {
      setAadhaarError("Enter valid 6-digit OTP");
      return;
    }
    setAadhaarError("");
    setIsSubmittingAadhaar(true);

    const res = await submitAadhaarOtp({
      aadhaarNumber,
      otp: aadhaarOtp,
    });

    setIsSubmittingAadhaar(false);

    if (res.success) {
      setKycData((prev) => ({
        ...prev,
        aadhaarStatus: "VERIFIED",
        aadhaarNumberMasked: res.data.aadhaarMasked,
      }));
      setActiveStep(null);
      setSuccessMessage("Aadhaar DigiLocker Verified!");
    } else {
      setAadhaarError(res.error || "Aadhaar verification failed");
    }
  };

  return {
    kycData,
    isLoading,
    activeStep,
    setActiveStep,
    panNumber,
    setPanNumber,
    panName,
    setPanName,
    dob,
    setDob,
    panError,
    isSubmittingPan,
    handleVerifyPan,
    aadhaarNumber,
    setAadhaarNumber,
    aadhaarOtp,
    setAadhaarOtp,
    otpSent,
    handleSendAadhaarOtp,
    aadhaarError,
    isSubmittingAadhaar,
    handleVerifyAadhaar,
    biometricsEnabled,
    setBiometricsEnabled,
    twoFactorEnabled,
    setTwoFactorEnabled,
    successMessage,
    setSuccessMessage,
  };
}
