import React, { Fragment } from "react";

const LandingPage = () => {
  return (
    <Fragment>
      {/* Load external styles and fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

      {/* Custom CSS with fixes for horizontal scrollbar */}
      <style>
        {`
          /* Base styles */
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
            min-height: 100vh;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }

          /* Prevent horizontal overflow */
          html {
            overflow-x: hidden;
          }

          /* Glass effect */
          .wd-glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          /* Navigation */
          .wd-nav {
            width: 100%;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
          }

          /* Main content */
          .wd-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3rem 1.5rem;
            box-sizing: border-box;
            width: 100%;
          }

          /* Hero grid */
          .wd-hero-grid {
            max-width: 80rem;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            margin: 0 auto;
          }

          /* Zones grid */
          .wd-zones-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            width: 100%;
          }

          /* Ensure images and cards don't overflow */}
          .wd-zone-card,
          .wd-preview-box,
          .wd-feature-card {
            width: 100%;
            box-sizing: border-box;
          }

          /* Footer */
          .wd-footer {
            width: 100%;
            padding: 1.5rem 2rem;
            box-sizing: border-box;
          }

          /* Responsive adjustments */
          @media (max-width: 56.25rem) {
            .wd-hero-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
            .wd-nav-links {
              display: none;
            }
          }

          @media (max-width: 68.75rem) {
            .wd-zones-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 43.75rem) {
            .wd-zones-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}
      </style>

      {/* Root container with overflow fix */}
      <div style={{ overflowX: 'hidden' }}>
        {/* Navigation */}
        <nav className="wd-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              WeatherDash
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '2rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            alignItems: 'center'
          }}>
            <a href="#features" style={{ color: '#fff', textDecoration: 'none' }}>Features</a>
            <a href="#global-zones" style={{ color: '#fff', textDecoration: 'none' }}>Global Zones</a>
            <a href="#support" style={{ color: '#fff', textDecoration: 'none' }}>Support</a>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem 1.5rem',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '80rem',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            margin: '0 auto'
          }}>
            {/* Hero Left */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(2.25rem, 3.125vw, 4rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  margin: 0
                }}>
                  Weather Intelligence <br />
                  <span style={{ color: '#bfdbfe' }}>Across Every Zone.</span>
                </h1>
                <p style={{
                  margin: '1.5rem 0 0',
                  fontSize: '1.125rem',
                  color: '#eff6ff',
                  maxWidth: '30rem',
                  lineHeight: 1.7
                }}>
                  Experience the next generation of weather tracking. WeatherDash provides hyper-local data organized by continental zones, from the peaks of Antarctica to the bustling cities of East Asia.
                </p>
              </div>
              <div>
                <a href="/signup" style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: '#fff',
                  color: '#2563eb',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0.625rem 1.875rem rgba(0, 0, 0, 0.15)'
                }}>
                  Get Started for Free
                </a>
              </div>
              <div style={{ position: 'relative', cursor: 'pointer', paddingTop: '1rem' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-0.25rem',
                  background: 'rgba(96, 165, 250, 0.3)',
                  borderRadius: '1.25rem',
                  filter: 'blur(0.5rem)',
                  opacity: 0.25
                }} />
                <div style={{
                  position: 'relative',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)'
                }}>
                  <img
                    alt="Dynamic atmospheric map"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuxxRZhi2GALDyj3FkSJx6QkwKg9I4lEdA6Kt3gGV7xOc8VoLgWjtM4vjS6P0j7enS0FVhDRwFeRSoJLShc9Eu8421GD5izNOYy-1EF44F-WVi8SOFLiub5Y1jPfqX3nM4-9KBwGlcLItuS3Y6wVO5H2OrcNh19rymINnu_vWqlAF4xabBxB7Js3MQfx61KQWzoGbl1Y15G3ksKvIyBaJ4BVLOVRdmMOqZrXlZ9OwW0fiN8dk3JPN0yaVvcyaGKuTe2gDmGSPeulg"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            </section>

            {/* Features Right */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} id="features">
              {[
                {
                  icon: "query_stats",
                  title: "Comprehensive Forecasts",
                  desc: "Deep-dive meteorological insights with advanced predictive modeling for short and long-term planning.",
                },
                {
                  icon: "analytics",
                  title: "Zone-based Analytics",
                  desc: "Aggregated climate data and trend analysis specific to major global continental zones.",
                },
                {
                  icon: "history",
                  title: "Historical Data",
                  desc: "Access decades of atmospheric records to identify patterns and seasonal anomalies in your region.",
                },
              ].map((feature) => (
                <div key={feature.title} style={{
                  padding: '1.75rem 2rem',
                  borderRadius: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: 'rgba(219, 234, 254, 0.8)',
                      lineHeight: 1.6,
                      fontSize: '0.875rem'
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Social Proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex' }}>
                  {[
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?q=80&w=1476&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=687&auto=format&fit=crop",
                  ].map((src, index) => (
                    <div key={index} style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      border: '2px solid #60a5fa',
                      overflow: 'hidden',
                      marginLeft: index === 0 ? '0' : '-0.75rem'
                    }}>
                      <img src={src} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#eff6ff' }}>
                  Trusted by 10k+ meteorologists worldwide
                </p>
              </div>
            </section>
          </div>

          {/* Global Zones */}
          <section style={{ maxWidth: '80rem', width: '100%', marginTop: '5rem' }} id="global-zones">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', margin: '0 0 3rem' }}>
              Coverage by Global Zone
            </h2>
            <div style={{
              className: 'zone-grid',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              width: '100%'
            }}>
              {[
                {
                  name: "Africa",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdCF-tk8S5FzYdglE8n_kHPbkDLHo1hUHfp0RhM-KBtOTdh4kYhQ7Aja9VirDNU6lvBJOSs0zqxAEkHiN-TabA283_yp5VsXcSdZLyOVXmrZ3tI1eJ2XSlkhrdBdohZXqmunhBv_hbaKJObF7457f65cFgjVrEk6r3VFgA-VwchI0om71uR3yfsgzi3zNIk3oJXRGvulQFdJjVQOV0o1t_0a9WloZTCp_b3cS_6aXxfPcMG-X2B_ZFA3P_h5JqDYHoZrfLrG22wUc",
                },
                {
                  name: "Europe",
                  src: "https://img.icons8.com/?size=100&id=21742&format=png&color=000000",
                },
                {
                  name: "North America",
                  src: "https://img.icons8.com/?size=100&id=Mxu3y4g3tnM6&format=png&color=000000",
                },
                {
                  name: "South America",
                  src: "https://img.icons8.com/?size=100&id=VrLfcIbeASYP&format=png&color=000000",
                },
                {
                  name: "Middle East",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhh4oUpixrnCSw7H1NWpfBj_Wax8kPJp2JN-th2tPru1P5eR82PSdp0hlpF74fxN8-vAZ97Oaji2ulB0Z68UeocJ6kZJUiwESXaN5koYEBNOygXvRz8_3BPmpheGtbNQ6RV-2P2TQUDfsvhHAmube3U7ubdOEx6qzLDCgjgPk12Lnsc1A3460YJSpuBnGBdZ0Ec_npPRmJu_Yl5lSxSOVhjYWdfs6Lnxlm-LHbs496HEU3xIiqa_-7fw-mfZ-BHgSW7Uu9E53dQ9E",
                },
                {
                  name: "South Asia",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcoe31XlBQ-B68cJEitfu-87kTdJPr5h7R6Fe4ZNMmvOMXQvfGRXf707pFKYTcwANhhMq6BBpnOSa1Jpfrmzp8_RfYLE4PvUHwcf317XNZzVhwqBtAspuLPT336vDbwWkMRx__YpzicmXII7YpxN2hxas9nmMj2IhyVntu0N_C-a9v3qHbAMRd-8uHlrJrT75EgdCcPyL3rRn4n9LHMH6fBK2LcqMUHEuKJLtA9ZjWgLc4Pn7fYxjsGHlSpVzg-CFOBfCezGvKZt4",
                },
                {
                  name: "Southeast Asia",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC35ZdknmCfrhz5ZAi55Y1Tv4iCV8fHe8gp6JwT_3YDkW-TctoW8oNu1aDnGafOsC1kRlnxiW_F-2zCJKcijD-k7nYKwR2T0DJeyl3CXpQHibwc38NcWKeM6OTgfoRV44bwOCmHdUWzgGlLvoeumQ9_2-qtNw09Gbro-SbsFIbnqu1SLkUzaceo03erFSYBGNx4lr7vZGotOhSqMP5EVKefXE6kc1oIDrOhJ757ynZCKb4WpzeLo0K6thqbq6HUKbgCQ-TnAfdziUE",
                },
                {
                  name: "East Asia",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfbwHq-lylgP2mqVW7_CmJFdofwImc9Y5LA4haiQnzOSaw8WuUz_-lwc-TTkp38797OAEOrzXfnilPw-C3GgWP84705MNIttamamUrgdrhgoDp7kLySW636SMiFB3Ve7R7sQggSB_my_hrfTNytstY0YnVc4Ds_bq0wShj8jntkyR6TEg2fsVqV4YR9BgolKBhgAZSvn1UDR6PSlZDFBXxLvdcFE1uEvvVaaKpEVGjRmRDeCqkOqpNr3yL5pRqn1TK4E0MgLXgtHk",
                },
                {
                  name: "Central Asia",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtL7hvfY06Hm4VE7fKFQ4JY3RvzHcZ4Ujv4u7F1n3tc2pJeGq8Psewdfp1BzTKhj_CrnYmEwjlT24rqHUV-_pCg2xbftf9HE9PIb_nKQjuRCEsdpqstomAZ1BucP_JWS8sXEdfO0nVfkTFQ9pMY9cHgvvT0-SrN0nM_ga4uLtjYLlm4VZv2cGijTao2n3IWyyX97qtMJSox4lussmJ3AuGC4oeUWOoCtIPzyhvXl776TiTO0Tp7oVpbyzBaVUTU39N8Nt2Iz3FHvQ",
                },
                {
                  name: "Oceania",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPwU1qw8fTP10CznuHSDW_7NyY0BTqqEF3oNS4BHF1oYCFk8ct-XaSIvBtEUwl_RGaPlEITpjUKJFhuGk8WIVSKV6PitEpV3ylHoR8D--Ajek3N6FnBEl1rnAUdGEgkombwX2B5G42Sd5Ck2Nf3UNweXvVcKtgx8dq4DDbN85VKm2EAueXWIkTLfqZ6roD_vEPuvTY7OuWno7zDx0UrjkKD2TLdaB7t2AAu14VDaK-XWemOY6rTYiof3tQZhmMJdxi2skuH2mZyaE",
                },
                {
                  name: "Antarctica",
                  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBq-d8_cdqdUmyvAqcxHBYPE5PMVvnUoVSSdXgY-K6xlAXipUFs88MbMl2jX46LkAZUlb6MzTIvQQ9R5hXthOlKLWHOIMZjJDw0JYX56Xikk4E98BaazJsbbjlvqtO5CQt9ip4Ot5owdI7j6qYHlX5C6IJD792MY5nFF03tTDr18VHqerEtuWDqYQi0ibcKeem8qHc6zJSrTJFtcZ-kqaXW_D-iZUGSQm7EEquMDigf9wt7pUmdieHhmVYPG8Nabb4AXXm_GucipUs",
                },
              ].map((zone) => (
                <div key={zone.name} style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.625rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img src={zone.src} alt={zone.name} style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain' }} />
                  </div>
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.0625rem',
                    textTransform: 'uppercase',
                    color: '#bfdbfe',
                    margin: 0
                  }}>
                    {zone.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Support */}
          <section style={{ maxWidth: '80rem', width: '100%', marginTop: '5rem', marginBottom: '3rem', textAlign: 'center' }} id="support">
            <div style={{
              display: 'inline-block',
              maxWidth: '37.5rem',
              width: '100%',
              padding: '3rem',
              borderRadius: '1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Support</h2>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: '0 0 1.5rem' }}>
                Reach us through any of these platforms
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Facebook */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                  >
                    <path
                      d="M46.4927 38.6403L47.7973 30.3588H39.7611V24.9759C39.7611 22.7114 40.883 20.4987 44.4706 20.4987H48.1756V13.4465C46.018 13.1028 43.8378 12.9168 41.6527 12.8901C35.0385 12.8901 30.7204 16.8626 30.7204 24.0442V30.3588H23.3887V38.6403H30.7204V58.671H39.7611V38.6403H46.4927Z"
                      fill="#337FFF"
                    />
                  </svg>
                </button>

                {/* Instagram */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.4456 35.7808C27.4456 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM22.9377 35.7808C22.9377 42.8708 28.6883 48.618 35.7826 48.618C42.8768 48.618 48.6275 42.8708 48.6275 35.7808C48.6275 28.6908 42.8768 22.9436 35.7826 22.9436C28.6883 22.9436 22.9377 28.6908 22.9377 35.7808ZM46.1342 22.4346C46.1339 23.0279 46.3098 23.608 46.6394 24.1015C46.9691 24.595 47.4377 24.9797 47.9861 25.2069C48.5346 25.4342 49.1381 25.4939 49.7204 25.3784C50.3028 25.2628 50.8378 24.9773 51.2577 24.5579C51.6777 24.1385 51.9638 23.6041 52.0799 23.0222C52.1959 22.4403 52.1367 21.8371 51.9097 21.2888C51.6828 20.7406 51.2982 20.2719 50.8047 19.942C50.3112 19.6122 49.7309 19.436 49.1372 19.4358H49.136C48.3402 19.4361 47.5771 19.7522 47.0142 20.3144C46.4514 20.8767 46.1349 21.6392 46.1342 22.4346ZM25.6765 56.1302C23.2377 56.0192 21.9121 55.6132 21.0311 55.2702C19.8632 54.8158 19.0299 54.2746 18.1538 53.4002C17.2777 52.5258 16.7354 51.6938 16.2827 50.5266C15.9393 49.6466 15.533 48.3214 15.4222 45.884C15.3009 43.2488 15.2767 42.4572 15.2767 35.781C15.2767 29.1048 15.3029 28.3154 15.4222 25.678C15.5332 23.2406 15.9425 21.918 16.2827 21.0354C16.7374 19.8682 17.2789 19.0354 18.1538 18.1598C19.0287 17.2842 19.8612 16.7422 21.0311 16.2898C21.9117 15.9466 23.2377 15.5406 25.6765 15.4298C28.3133 15.3086 29.1054 15.2844 35.7826 15.2844C42.4598 15.2844 43.2527 15.3106 45.8916 15.4298C48.3305 15.5408 49.6539 15.9498 50.537 16.2898C51.7049 16.7422 52.5382 17.2854 53.4144 18.1598C54.2905 19.0342 54.8308 19.8682 55.2855 21.0354C55.6289 21.9154 56.0351 23.2406 56.146 25.678C56.2673 28.3154 56.2915 29.1048 56.2915 35.781C56.2915 42.4572 56.2673 43.2466 56.146 45.884C56.0349 48.3214 55.6267 49.6462 55.2855 50.5266C54.8308 51.6938 54.2893 52.5266 53.4144 53.4002C52.5394 54.2738 51.7049 54.8158 50.537 55.2702C49.6565 55.6134 48.3305 56.0194 45.8916 56.1302C43.2549 56.2514 42.4628 56.2756 35.7826 56.2756C29.1024 56.2756 28.3125 56.2514 25.6765 56.1302ZM25.4694 10.9322C22.8064 11.0534 20.9867 11.4754 19.3976 12.0934C17.7518 12.7316 16.3585 13.5878 14.9663 14.977C13.5741 16.3662 12.7195 17.7608 12.081 19.4056C11.4626 20.9948 11.0403 22.8124 10.9191 25.4738C10.7958 28.1394 10.7676 28.9916 10.7676 35.7808C10.7676 42.57 10.7958 43.4222 10.9191 46.0878C11.0403 48.7494 11.4626 50.5668 12.081 52.156C12.7195 53.7998 13.5743 55.196 14.9663 56.5846C16.3583 57.9732 17.7518 58.8282 19.3976 59.4682C20.9897 60.0862 22.8064 60.5082 25.4694 60.6294C28.138 60.7506 28.9893 60.7808 35.7826 60.7808C42.5759 60.7808 43.4286 60.7526 46.0958 60.6294C48.759 60.5082 50.5774 60.0862 52.1676 59.4682C53.8124 58.8282 55.2066 57.9738 56.5989 56.5846C57.9911 55.1954 58.8438 53.7998 59.4842 52.156C60.1026 50.5668 60.5268 48.7492 60.6461 46.0878C60.7674 43.4202 60.7956 42.57 60.7956 35.7808C60.7956 28.9916 60.7674 28.1394 60.6461 25.4738C60.5248 22.8122 60.1026 20.9938 59.4842 19.4056C58.8438 17.7618 57.9889 16.3684 56.5989 14.977C55.2088 13.5856 53.8124 12.7316 52.1696 12.0934C50.5775 11.4754 48.7588 11.0514 46.0978 10.9322C43.4306 10.811 42.5779 10.7808 35.7846 10.7808C28.9913 10.7808 28.138 10.809 25.4694 10.9322Z"
                      fill="url(#ig1)"
                    />
                    <defs>
                      <radialGradient
                        id="ig1"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(17.4144 61.017) scale(65.31 65.2708)"
                      >
                        <stop offset="0.09" stopColor="#FA8F21" />
                        <stop offset="0.78" stopColor="#D82D7E" />
                      </radialGradient>
                    </defs>
                  </svg>
                </button>

                {/* X / Twitter */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                  >
                    <path
                      d="M40.7568 32.1716L59.3704 11H54.9596L38.7974 29.383L25.8887 11H11L30.5205 38.7983L11 61H15.4111L32.4788 41.5869L46.1113 61H61L40.7557 32.1716H40.7568ZM34.7152 39.0433L32.7374 36.2752L17.0005 14.2492H23.7756L36.4755 32.0249L38.4533 34.7929L54.9617 57.8986H48.1865L34.7152 39.0443V39.0433Z"
                      fill="black"
                    />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.6975 11C12.6561 11 11 12.6057 11 14.5838V57.4474C11 59.4257 12.6563 61.03 14.6975 61.03H57.3325C59.3747 61.03 61.03 59.4255 61.03 57.4468V14.5838C61.03 12.6057 59.3747 11 57.3325 11H14.6975ZM26.2032 30.345V52.8686H18.7167V30.345H26.2032ZM26.6967 23.3793C26.6967 25.5407 25.0717 27.2703 22.4615 27.2703L22.4609 27.2701H22.4124C19.8998 27.2701 18.2754 25.5405 18.2754 23.3791C18.2754 21.1686 19.9489 19.4873 22.5111 19.4873C25.0717 19.4873 26.6478 21.1686 26.6967 23.3793ZM37.833 52.8686H30.3471L30.3469 52.8694C30.3469 52.8694 30.4452 32.4588 30.3475 30.3458H37.8336V33.5339C38.8288 31.9995 40.6098 29.8169 44.5808 29.8169C49.5062 29.8169 53.1991 33.0363 53.1991 39.9543V52.8686H45.7133V40.8204C45.7133 37.7922 44.6293 35.7269 41.921 35.7269C39.8524 35.7269 38.6206 37.1198 38.0796 38.4653C37.8819 38.9455 37.833 39.6195 37.833 40.2918V52.8686Z"
                      fill="#006699"
                    />
                  </svg>
                </button>

                {/* Telegram */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M61.03 36.015C61.03 49.8304 49.8304 61.03 36.015 61.03C22.1996 61.03 11 49.8304 11 36.015C11 22.1996 22.1996 11 36.015 11C49.8304 11 61.03 22.1996 61.03 36.015ZM38.4121 28.3392C34.1147 30.1955 21.7235 35.4671 21.7235 35.4671C18.7869 36.6551 20.5058 37.7688 20.5058 37.7688C20.5058 37.7688 23.0127 38.6599 25.1615 39.328C27.3103 39.9963 28.4563 39.2538 28.4563 39.2538C28.4563 39.2538 33.47 35.8384 38.5554 32.2002C42.1366 29.6757 41.2772 31.7547 40.4176 32.6457C38.5554 34.5762 35.4755 37.6204 32.897 40.0706C31.751 41.1101 32.324 42.001 32.8254 42.4465C34.2836 43.7256 37.718 46.0518 39.2773 47.1079C39.7093 47.4005 39.9974 47.5956 40.0596 47.6439C40.4176 47.941 42.4232 49.2774 43.6408 48.9804C44.8584 48.6834 45.0017 46.9757 45.0017 46.9757C45.0017 46.9757 45.9328 40.8873 46.7923 35.3186C46.9515 34.2252 47.1107 33.1548 47.2592 32.1567C47.645 29.5623 47.9582 27.4565 48.0099 26.7058C48.2248 24.1814 45.6463 25.2208 45.6463 25.2208C45.6463 25.2208 40.0596 27.5968 38.4121 28.3392Z"
                      fill="#34AADF"
                    />
                  </svg>
                </button>

                {/* Gmail */}
                <button style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.625rem',
                  background: '#fff',
                  boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 72 72"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.0065 56.1236H21.4893V35.5227L9.37109 26.4341V52.4881C9.37109 54.4997 11.001 56.1236 13.0065 56.1236Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M50.5732 56.1236H59.056C61.0676 56.1236 62.6914 54.4937 62.6914 52.4881V26.4341L50.5732 35.5227"
                      fill="#34A853"
                    />
                    <path
                      d="M50.5732 19.7693V35.5229L62.6914 26.4343V21.587C62.6914 17.0912 57.5594 14.5282 53.9663 17.2245"
                      fill="#FBBC04"
                    />
                    <path
                      d="M21.4893 35.5227V19.769L36.0311 30.6754L50.5729 19.769V35.5227L36.0311 46.429"
                      fill="#EA4335"
                    />
                    <path
                      d="M9.37109 21.587V26.4343L21.4893 35.5229V19.7693L18.0962 17.2245C14.4971 14.5282 9.37109 17.0912 9.37109 21.587Z"
                      fill="#C5221F"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer style={{
          width: '100%',
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
            color: 'rgba(219, 234, 254, 0.6)',
            fontWeight: 500
          }}>
            <p>© 2026 WeatherDash</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ color: 'rgba(219, 234, 254, 0.6)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(219, 234, 254, 0.6)', textDecoration: 'none' }}>Terms of Use</a>
              <a href="#" style={{ color: 'rgba(219, 234, 254, 0.6)', textDecoration: 'none' }}>Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </Fragment>
  );
};

export default LandingPage;