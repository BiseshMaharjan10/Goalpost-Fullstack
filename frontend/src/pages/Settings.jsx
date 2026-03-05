import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Building2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getSettings, updateSettings } from "../services/api";

const Settings = () => {
  const [courtName, setCourtName] = useState("");
  const [address, setAddress] = useState("");
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState("");
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        const data = res.data.data;
        setCourtName(data.courtName || "");
        setAddress(data.address || "");
        setOpeningTime(data.openingTime || "06:00");
        setClosingTime(data.closingTime || "23:00");
        setFacilities(data.facilities || []);
        setRules(data.courtRules || []);
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddFacility = () => {
    const trimmed = newFacility.trim();
    if (!trimmed) return;
    setFacilities((prev) => [...prev, trimmed]);
    setNewFacility("");
  };

  const handleRemoveFacility = (index) => {
    setFacilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    setRules((prev) => [...prev, trimmed]);
    setNewRule("");
  };

  const handleRemoveRule = (index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings({
        courtName,
        address,
        openingTime,
        closingTime,
        facilities,
        courtRules: rules,
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 ml-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex-1 ml-72 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Settings</h1>
              <p className="text-gray-500">Manage court information and booking rules</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Court Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Court Information</h2>
                <p className="text-sm text-gray-500">Basic details about your facility</p>
              </div>
            </div>

            {/* Court Name & Address */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Court Name</label>
                <input
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Opening & Closing Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Facilities */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Facilities</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {facility}
                    <button
                      onClick={() => handleRemoveFacility(index)}
                      className="hover:text-green-900 transition-colors ml-0.5 text-lg leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFacility()}
                  placeholder="Add a facility..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddFacility}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-800 text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Court Rules */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Court Rules</label>
              <div className="flex flex-col gap-2 mb-3">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700"
                  >
                    <span>{rule}</span>
                    <button
                      onClick={() => handleRemoveRule(index)}
                      className="text-gray-400 hover:text-gray-700 transition-colors ml-4 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
                  placeholder="Add a rule..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddRule}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-800 text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;