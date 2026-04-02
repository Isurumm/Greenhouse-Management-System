import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProducts } from "../api/productsApi";
import { Spin, Alert } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  TruckOutlined,
  StarFilled,
} from "@ant-design/icons";
import hero from "../assets/hero.jpg";

/* ─── Tiny reusable badge ────────────────────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-SGBUS-green/10 text-SGBUS-green text-xs font-semibold uppercase tracking-widest">
   
    {children}
  </span>
);

/* ─── Benefit card ───────────────────────────────────────────────────────── */
const BenefitCard = ({ icon, title, desc }) => (
  <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors text-4xl">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ─── Fake product card (Phase 2 placeholder) ────────────────────────────── */
const ProductCard = ({ product, badge }) => (
  <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {badge && (
        <span className="absolute top-3 left-3 text-xs font-semibold bg-green-600 text-white px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>

    <div className="p-4">
      <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
        {product.category}
      </p>
      <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>

      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-extrabold text-gray-900">
          Rs.{product.price?.toFixed(2)}
        </span>

        <Link
          to={`/product/${product._id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-cal-poly-green hover:text-green-600 transition-colors"
        >
          View <ArrowRightOutlined className="text-xs" />
        </Link>
      </div>
    </div>
  </div>
);

/* ─── Stat badge ─────────────────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-black text-gray-900">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProductsError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load products",
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const key = product.category?.trim() || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const emojiMap = {
      Vegetables: "🥦",
      "Leafy Greens": "🥬",
      Herbs: "🌿",
      Fruits: "🍅",
      Other: "📦",
    };

    const bgMap = {
      Vegetables: "",
      "Leafy Greens": "",
      Herbs: "",
      Fruits: "",
      Other: "",
    };

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      emoji: emojiMap[label] || "📦",
      bg: bgMap[label] || "from-gray-50 to-gray-100",
    }));
  }, [products]);

  const featuredProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.countInStock > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [products]);

  return (
    <div className="font-poppins">
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 px-6">
       

        <div className="relative max-w-7xl mx-auto w-full flex">
          <div className="w-1/2">
            <div>Fresh from the Polytunnel</div>

            <h1 className="mt-1 text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Farm Fresh Crops,{" "}
              <span className="bg-clip-text text-transparent bg-SGBUS-green">
                Delivered to You
              </span>
            </h1>

            <p className="mt-2 text-md text-gray-500 leading-relaxed max-w-xl">
              High-quality polytunnel-grown produce, harvested at peak freshness
              and brought directly from our farms to your table.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center gap-2 px-8 py-2 bg-SGBUS-green hover:bg-cal-poly-green text-white font-bold rounded-3xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-200 text-base"
              >
                Shop Now <ArrowRightOutlined />
              </button>
              <button
                onClick={() => navigate("/about")}
                className="inline-flex items-center gap-2 px-8 py-2 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-3xl border border-gray-200 hover:border-green-200 transition-all duration-200 text-base"
              >
                Learn More
              </button>
            </div>
          </div>
<div className="w-1/2">
  <img src={hero} alt="" className="rounded-3xl" />
</div>

        </div>

        {/* Floating stats card */}
        <div className="relative max-w-7xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border border-SGBUS-green rounded-full p-8">
            <Stat value="50+" label="Crop varieties" />
            <Stat value="500+" label="Happy customers" />
            <Stat value="100%" label="Polytunnel grown" />
            <Stat value="3×" label="Faster delivery" />
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORIES ────────────────────────────────────────────────── */}
      <section className="pb-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <Tag>Browse Categories</Tag>
              <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900">
                Fresh crop categories
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 text-cal-poly-green font-semibold hover:gap-3 transition-all"
            >
              View all <ArrowRightOutlined />
            </button>
          </div>

        
            {loadingProducts ? (
              <div className="flex justify-center py-10">
                <Spin size="large" />
              </div>
            ) : productsError ? (
              <Alert type="error" message={productsError} showIcon />
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No categories available yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(({ label, emoji, bg, count }) => (
                  <button
                    key={label}
                    onClick={() => navigate("/shop")}
                    className={`group bg-white border border-SGBUS-green ${bg} rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-md transition-all duration-200`}
                  >
                    <span className="text-4xl block mb-3">{emoji}</span>
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {count} {count === 1 ? "item" : "items"}
                    </p>
                  </button>
                ))}
              </div>
            )}
       
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <Tag>This Week's Picks</Tag>
              <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900">
                Featured products
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 text-cal-poly-green font-semibold hover:gap-3 transition-all"
            >
              Browse all products <ArrowRightOutlined />
            </button>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : productsError ? (
            <Alert type="error" message={productsError} showIcon />
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No featured products available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  badge={index === 0 ? "New" : index === 1 ? "Popular" : ""}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. WHY CHOOSE US ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Tag>Why PolyCrop</Tag>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900">
              The smart way to buy fresh
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              We combine modern polytunnel agriculture with a seamless online
              shopping experience — quality you can taste, convenience you'll
              love.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={<EnvironmentOutlined />}
              title="Polytunnel Grown"
              desc="Our crops grow in controlled polytunnel environments, ensuring superior quality, consistency, and pest-free produce year-round."
            />
            <BenefitCard
              icon={<SafetyOutlined />}
              title="Quality Guaranteed"
              desc="Every harvest is quality-checked before listing. You get only the freshest, highest-grade produce available."
            />
            <BenefitCard
              icon={<TruckOutlined />}
              title="Fast Delivery"
              desc="From polytunnel to your door. We ensure quick, reliable delivery so your produce arrives at peak freshness."
            />
            <BenefitCard
              icon={<CheckCircleOutlined />}
              title="Easy Ordering"
              desc="Browse, add to cart, and checkout in minutes. Our streamlined platform makes buying fresh produce effortless."
            />
            <BenefitCard
              icon="🌱"
              title="Sustainably Farmed"
              desc="Polytunnel farming reduces water usage and eliminates pesticide runoff — better for you and the environment."
            />
            <BenefitCard
              icon="📦"
              title="Secure Packaging"
              desc="Produce is packed with care to preserve freshness during transit. Arrives clean, cool, and ready to use."
            />
          </div>
        </div>
      </section>

      {/* ── 5. ABOUT PREVIEW ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-cal-poly-green">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Tag>Our Story</Tag>
              <h2 className="mt-4 text-3xl md:text-4xl font-black text-white leading-tight">
                Technology meets agriculture — the future of fresh produce
              </h2>
              <p className="mt-5 text-green-100 leading-relaxed text-lg">
                PolyCrop is built on a simple belief: modern technology can make
                agriculture more connected, efficient, and accessible. We manage
                polytunnel crop production while giving customers direct access
                to the freshest harvest.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Smart polytunnel crop management",
                  "Direct farm-to-customer selling",
                  "Real-time harvest availability",
                  "Efficient and organized operations",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-green-100"
                  >
                    <CheckCircleOutlined className="text-green-300 text-base flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/about")}
                className="mt-9 inline-flex items-center gap-2 px-7 py-2 bg-white text-green-800 font-bold rounded-full hover:bg-green-50 transition-colors"
              >
                Learn about us <ArrowRightOutlined />
              </button>
            </div>

            {/* Illustration placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-3" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Crops Managed",
                        value: "200+",
                        color: "from-green-400/30 to-green-500/30",
                      },
                      {
                        label: "Orders Fulfilled",
                        value: "1.2K+",
                        color: "from-emerald-400/30 to-emerald-500/30",
                      },
                      {
                        label: "Polytunnels",
                        value: "8",
                        color: "from-teal-400/30 to-teal-500/30",
                      },
                      {
                        label: "Customer Rating",
                        value: "4.9★",
                        color: "from-lime-400/30 to-lime-500/30",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-center`}
                      >
                        <div className="text-2xl font-black text-white">
                          {value}
                        </div>
                        <div className="text-xs text-green-100 mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-white/10 rounded-2xl p-4 text-center">
                    <p className="text-white/80 text-sm">
                      🌿 From our polytunnels to your table
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA / CONTACT TEASER ──────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
         
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-gray-900">
            Have questions? We're here.
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Whether it's about an order, our products, or the platform — reach
            out and our team will respond quickly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 px-8 py-2 bg-SGBUS-green hover:bg-cal-poly-green text-white font-bold rounded-full shadow-lg shadow-green-200 transition-all"
            >
              Contact Us <ArrowRightOutlined />
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-8 py-2 bg-white text-gray-800 font-bold rounded-full border border-gray-200 hover:border-SGBUS-green transition-all"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
