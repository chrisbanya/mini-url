import { BsCopy } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";

const UrlLists = ({ setIsVisible, shortenedLinks }) => {
  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard !", {
        ariaLabel: "copied to clipboard notification",
        position: "top-right",
      });
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="w-full mt-6 mb-6 p-5 bg-white rounded border border-blue-500">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Your recent Mini Urls</h2>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="cursor-pointer"
        >
          <IoClose className="text-2xl text-[#FF5E3A]" />
        </button>
      </div>
      {shortenedLinks.map((link, index) => (
        <div
          key={index}
          className="border border-gray-500 rounded mt-2 mb-2 p-2"
        >
          <div className="flex items-center space-x-1.5">
            <span className="text-blue-700 font-semibold">{link.tiny_url}</span>
            <button
              type="button"
              title="copy to clipboard"
              onClick={() => handleCopy(link.tiny_url)}
            >
              <BsCopy />
            </button>
          </div>
          <p className="py-2">Original: {link.url} </p>
          <p>
            Created: {new Date(link.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UrlLists;
