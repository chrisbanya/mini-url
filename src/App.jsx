import { useState, useEffect } from "react";
import { BsCopy } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UrlLists from "./components/UrlLists";

function App() {
  const [formData, setFormData] = useState({
    url: "",
    domain: "tinyurl.com",
    alias: "",
    tags: "",
    expires_at: "",
    description: "",
  });
  const [resData, setResData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const apiKey = import.meta.env.VITE_TINYURL_API_KEY;
  const [isVisible, setIsVisible] = useState(false);
  const [shortenedLinks, setShortenedLinks] = useState(() => {
    const saved = localStorage.getItem("shortenedLinks");
    return saved ? JSON.parse(saved) : [];
  });
  // console.log(apiKey)

  useEffect(() => {
    localStorage.setItem("shortenedLinks", JSON.stringify(shortenedLinks));
  }, [shortenedLinks]);

  function handleChange(e) {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  const validateForm = () => {
    const urlErrors = {};

    const { url, alias } = formData;

    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    if (!url.trim()) {
      urlErrors.url = "URL is required";
    } else if (!isValidUrl(url)) {
      urlErrors.url = "Please enter a valid url";
    }
    if (!alias.trim()) {
      urlErrors.alias = "Alias is required";
    } else if (alias.trim().length < 5) {
      urlErrors.alias = "Alias must be at least 5 characters";
    }

    return urlErrors;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch(`https://api.tinyurl.com/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setResData(data.data);
        setShortenedLinks((prev) => [data.data, ...prev]);
        setFormData((prev) => ({ ...prev, url: "", alias: "" }));

        // setIsLoading(false);
      } else {
        const errorBody = await res.json();
        const err = `: ${errorBody.errors[0]}`;
        throw new Error(`Error: ${res.status} ${err}`);
      }
    } catch (error) {
      console.log(error);
      setError({ apiError: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyToClipboard(tiny_url) {
    try {
      await navigator.clipboard.writeText(tiny_url);
      toast.success("Copied to clipboard !", {
        ariaLabel: "copied to clipboard notification",
        position: "top-right",
      });
    } catch (error) {
      console.error("copy error", error);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen mx-auto ">
      <div className="w-11/12  flex ">
        <div className="h-screen overflow-y-auto  flex flex-col md:w-1/2 pt-16 custom-scrollbar  ">
          <div className="text-2xl text-left font-semibold   ">
            <h1 className="text-white">
              Effortlessly <span className="text-[#FF5E3A]">shorten</span> those
              long, pesky URLs with just a{" "}
              <span className="text-[#FF5E3A]">single click!</span> Say goodbye
              to cluttered links and hello to simplicity
            </h1>
          </div>
          {/* default view */}
          {!Object.keys(resData).length > 0 && (
            <div className="mt-4 p-5 py-10  rounded  bg-white">
              <div className="mb-4">
                <form
                  id="submitForm"
                  noValidate
                  autoComplete="off"
                  onSubmit={handleSubmit}
                  className="flex flex-col space-y-4"
                >
                  <label className="font-semibold">Shorten a long URL</label>
                  <input
                    className={`border ${
                      error.url ? "border-red-500" : "border-gray-400"
                    } bg-white px-2 py-2 outline-[#FF5E3A] rounded`}
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="Enter long link here"
                  />
                  {error.url && (
                    <p className="text-red-500 text-sm mt-1">{error.url}</p>
                  )}
                  <label className="font-semibold">Customize your links</label>
                  <input
                    className={`border ${
                      error.alias ? "border-red-500" : "border-gray-400"
                    } bg-white px-2 py-2 outline-[#FF5E3A] rounded`}
                    type="text"
                    name="alias"
                    value={formData.alias}
                    onChange={handleChange}
                    placeholder="Enter alias"
                  />
                  {error.alias && (
                    <p className="text-red-500 text-sm mt-1">{error.alias}</p>
                  )}
                </form>
              </div>

              <div className="flex flex-col justify-center items-center">
                <button
                  type="submit"
                  form="submitForm"
                  className="px-4 w-[90%] py-2 bg-[#FF5E3A] font-bold text-white rounded cursor-pointer"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    "Shorten URL"
                  )}
                </button>
                {error.apiError && (
                  <p className="text-red-500 text-sm mt-1">{error.apiError}</p>
                )}
              </div>
            </div>
          )}
          {/* end of default view */}

          {/* conditional view */}

          {Object.keys(resData).length > 0 && (
            <div className="mt-4 p-5 rounded  bg-white">
              <ToastContainer />
              <div className="mb-4">
                <form className="flex flex-col space-y-4">
                  <label>Your long URL</label>
                  <input
                    className="border border-gray-400 bg-white px-2 py-2 rounded"
                    type="text"
                    value={resData.url}
                    readOnly

                    // placeholder="Enter long link here"
                  />
                  <label>Mini URL</label>
                  <input
                    className="border border-gray-400 bg-white px-2 py-2 rounded"
                    type="text"
                    value={resData.tiny_url}
                    readOnly
                    // placeholder="paste api res here"
                  />
                </form>
              </div>
              <div className="mb-4">
                <button
                  title="Copy To Clipboard"
                  onClick={() => handleCopyToClipboard(resData.tiny_url)}
                  className="flex items-center space-x-2 border border-[#FF5E3A] hover:bg-[#FF5E3A] hover:text-white font-semibold transition-colors duration-300 ease-in-out shadow px-2 py-2 rounded cursor-pointer"
                >
                  <span>Copy</span> <BsCopy />
                </button>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={isVisible === true}
                  onClick={() => setIsVisible(!isVisible)}
                  className="px-4  py-2 w-[36%] border border-[#FF5E3A] text-[#FF5E3A] hover:bg-[#FF5E3A] hover:text-white font-semibold transition-colors duration-300 ease-in-out shadow rounded cursor-pointer"
                >
                  My URLs
                </button>
                <button
                  onClick={() => setResData({})}
                  className="px-4 py-2 w-[55%] bg-[#FF5E3A] font-bold text-white rounded"
                >
                  Shorten another
                </button>
              </div>
            </div>
          )}
          {/* end of conditional view */}

          {/* Saved Url list  */}
          {isVisible && (
            <UrlLists
              setIsVisible={setIsVisible}
              shortenedLinks={shortenedLinks}
            />
          )}
        </div>

        <div className="hidden md:block w-1/2 sticky top-0 h-screen ">
          <img
            src="/Happy student-storyset.png"
            alt="People illustration by storyset"
          />
        </div>
      </div>
      {/* links will be displayed here */}
    </div>
  );
}

export default App;
