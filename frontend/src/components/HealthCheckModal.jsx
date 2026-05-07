import { useState, useEffect, useRef } from "react";
import {
  FiMic,
  FiLoader,
  FiMicOff,
} from "react-icons/fi";

export default function HealthCheckModal({
  onClose,
  setResult,
  setLoading,
}) {
  // =========================================
  // STATE
  // =========================================
  const [step, setStep] = useState(1);

  const [streamingText, setStreamingText] =
    useState("");

  const [isStreaming, setIsStreaming] =
    useState(false);

  // =========================================
  // 🎤 VOICE STATES
  // =========================================
  const [isListening, setIsListening] =
    useState(false);

  const [voiceSupported, setVoiceSupported] =
    useState(true);

  const [voiceLoading, setVoiceLoading] =
    useState(false);

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  // =========================================
  // 📋 FORM STATE
  // =========================================
  const [form, setForm] = useState({
    age: "",
    sex: "",
    symptoms: "",
    smoking: false,
    alcohol: false,
    exercise: "moderate",
    sleep: 6,
    diet: "average",
  });

  const [image, setImage] = useState(null);

  const [pdf, setPdf] = useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  // =========================================
  // ✅ CHECK SUPPORT
  // =========================================
  useEffect(() => {
    if (
      !navigator.mediaDevices ||
      !window.MediaRecorder
    ) {
      setVoiceSupported(false);
    }
  }, []);

  // =========================================
  // ✅ CLEANUP
  // =========================================
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [imagePreview]);

  // =========================================
  // STEP CONTROLS
  // =========================================
  const next = () =>
    setStep((prev) => prev + 1);

  const prev = () =>
    setStep((prev) => prev - 1);

  // =========================================
  // 🎤 START RECORDING
  // =========================================
  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setVoiceLoading(true);

          const audioBlob = new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          );

          const formData =
            new FormData();

          formData.append(
            "audio",
            audioBlob,
            "voice.webm"
          );

          const response = await fetch(
            "http://127.0.0.1:8000/transcribe",
            {
              method: "POST",
              body: formData,
            }
          );

          const data =
            await response.json();

          if (data.text) {
            setForm((prev) => ({
              ...prev,
              symptoms: prev.symptoms
                ? `${prev.symptoms} ${data.text}`
                : data.text,
            }));
          }
        } catch (err) {
          console.error(
            "Whisper error:",
            err
          );

          alert(
            "Voice transcription failed"
          );
        } finally {
          setVoiceLoading(false);
        }
      };

      mediaRecorder.start();

      setIsListening(true);

    } catch (err) {
      console.error(err);

      alert(
        "Microphone access denied"
      );
    }
  };

  // =========================================
  // 🎤 STOP RECORDING
  // =========================================
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      setIsListening(false);
    }
  };

  // =========================================
  // 🎤 TOGGLE VOICE
  // =========================================
  const toggleVoiceInput = () => {
    if (!voiceSupported) {
      alert(
        "Voice input not supported"
      );

      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // =========================================
  // 📦 BUILD FORM DATA
  // =========================================
  const buildFormData = () => {
    const fd = new FormData();

    fd.append("age", form.age);

    fd.append("sex", form.sex);

    fd.append(
      "symptoms",
      form.symptoms
    );

    fd.append(
      "smoking",
      String(form.smoking)
    );

    fd.append(
      "alcohol",
      String(form.alcohol)
    );

    fd.append(
      "exercise",
      form.exercise
    );

    fd.append(
      "sleep",
      String(form.sleep)
    );

    fd.append("diet", form.diet);

    if (image) {
      fd.append("image", image);
    }

    if (pdf) {
      fd.append("pdf", pdf);
    }

    return fd;
  };

  // =========================================
  // 🚀 SUBMIT
  // =========================================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      setStreamingText("");

      setIsStreaming(true);

      // STOP RECORDING
      if (isListening) {
        stopRecording();
      }

      // =====================================
      // STREAM REQUEST
      // =====================================
      const streamResponse =
        await fetch(
          "http://127.0.0.1:8000/analyze-stream",
          {
            method: "POST",
            body: buildFormData(),
          }
        );

      if (!streamResponse.ok) {
        throw new Error(
          "Streaming failed"
        );
      }

      const reader =
        streamResponse.body.getReader();

      const decoder =
        new TextDecoder();

      let streamed = "";

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) break;

        streamed += decoder.decode(value, {
          stream: true,
        });

        setStreamingText(streamed);
      }

      // =====================================
      // FINAL ANALYSIS
      // =====================================
      const finalResponse =
        await fetch(
          "http://127.0.0.1:8000/analyze",
          {
            method: "POST",
            body: buildFormData(),
          }
        );

      const data =
        await finalResponse.json();

      if (
        !finalResponse.ok ||
        !data.disease
      ) {
        throw new Error(
          data?.error ||
            "Analysis failed"
        );
      }

      const finalData = {
        ...data,

        health_score: Number(
          data.health_score || 0
        ),

        recommendation:
          Array.isArray(
            data.recommendation
          )
            ? data.recommendation
            : [],

        red_flags: Array.isArray(
          data.red_flags
        )
          ? data.red_flags
          : [],

        date: new Date().toISOString(),

        streaming: false,
      };

      setResult(finalData);

      // =====================================
      // CLOSE CLEANLY
      // =====================================
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Analysis failed"
      );
    } finally {
      setLoading(false);

      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* ===================================== */}
      {/* STREAMING OVERLAY */}
      {/* ===================================== */}
      {isStreaming && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 animate-in fade-in duration-300">

            <div className="flex items-center gap-3 mb-6">

              <FiLoader className="animate-spin text-blue-600 text-3xl" />

              <h2 className="text-2xl font-bold text-gray-800">
                AI Health Analysis
              </h2>
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 h-[350px] overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed border">

              {streamingText ||

                "Initializing AI medical analysis..."}

              <span className="animate-pulse text-blue-600 ml-1">
                |
              </span>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              AI is analyzing symptoms,
              lifestyle, medical files,
              and risk indicators...
            </p>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MAIN MODAL */}
      {/* ===================================== */}
      {!isStreaming && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">

          <div className="bg-white p-6 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                AI Health Check
              </h1>

              <p className="text-gray-500 mt-1">
                Advanced symptom &
                lifestyle analysis
              </p>
            </div>

            {/* STEP INDICATOR */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    step >= s
                      ? "bg-blue-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-5">
                  Basic Information
                </h2>

                <input
                  type="number"
                  placeholder="Enter Age"
                  className="w-full p-4 border rounded-xl mb-4"
                  value={form.age}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                />

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sex: "male",
                      }))
                    }
                    className={`flex-1 p-4 rounded-xl border ${
                      form.sex === "male"
                        ? "bg-blue-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    Male
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sex: "female",
                      }))
                    }
                    className={`flex-1 p-4 rounded-xl border ${
                      form.sex ===
                      "female"
                        ? "bg-pink-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>

                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold">
                    Symptoms
                  </h2>

                  {!voiceSupported && (
                    <span className="text-sm text-red-500">
                      Voice not supported
                    </span>
                  )}
                </div>

                {/* MIC */}
                <div className="flex justify-center mb-5">

                  <button
                    type="button"
                    onClick={
                      toggleVoiceInput
                    }
                    disabled={
                      !voiceSupported
                    }
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                      isListening
                        ? "bg-red-500 scale-110 animate-pulse"
                        : "bg-blue-500"
                    } text-white`}
                  >
                    {isListening ? (
                      <FiMicOff
                        size={34}
                      />
                    ) : voiceLoading ? (
                      <FiLoader
                        className="animate-spin"
                        size={34}
                      />
                    ) : (
                      <FiMic size={34} />
                    )}
                  </button>
                </div>

                <div className="text-center mb-5">
                  {isListening ? (
                    <div className="text-red-500 font-semibold">
                      Listening...
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tap microphone and
                      speak your symptoms
                    </p>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="Describe your symptoms..."
                  value={form.symptoms}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      symptoms:
                        e.target.value,
                    }))
                  }
                  className="w-full p-5 border rounded-2xl resize-none"
                />
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-5">
                  Upload Medical Files
                </h2>

                <div className="space-y-5">

                  <div>
                    <label className="block mb-2 font-medium">
                      Upload Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border p-3 rounded-xl"
                      onChange={(e) => {
                        const file =
                          e.target
                            .files[0];

                        setImage(file);

                        if (file) {
                          setImagePreview(
                            URL.createObjectURL(
                              file
                            )
                          );
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      Upload Medical PDF
                    </label>

                    <input
                      type="file"
                      accept=".pdf"
                      className="w-full border p-3 rounded-xl"
                      onChange={(e) =>
                        setPdf(
                          e.target
                            .files[0]
                        )
                      }
                    />
                  </div>

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-40 rounded-xl shadow"
                    />
                  )}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">
                  Lifestyle Analysis
                </h2>

                <div className="flex gap-4 mb-6">

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        smoking:
                          !prev.smoking,
                      }))
                    }
                    className={`flex-1 p-4 rounded-xl ${
                      form.smoking
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    🚬 Smoking
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        alcohol:
                          !prev.alcohol,
                      }))
                    }
                    className={`flex-1 p-4 rounded-xl ${
                      form.alcohol
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    🍺 Alcohol
                  </button>
                </div>

                <div className="mb-6">
                  <p className="font-medium mb-3">
                    Exercise Level
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "low",
                      "moderate",
                      "high",
                    ].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              exercise:
                                level,
                            })
                          )
                        }
                        className={`p-3 rounded-xl border ${
                          form.exercise ===
                          level
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-medium mb-2">
                    Sleep: {form.sleep} hrs
                  </p>

                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={form.sleep}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sleep:
                          e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* CONTROLS */}
            <div className="flex justify-between mt-8">

              {step > 1 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="px-5 py-3 rounded-xl bg-gray-200"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-3 rounded-xl bg-blue-500 text-white"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Analyze Health
                </button>
              )}
            </div>

            {/* CLOSE */}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 text-red-500"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}