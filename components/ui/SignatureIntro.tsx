"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIGNATURE_PATH =
  "M 8 114 \
   C 20 111, 33 104, 47 97 \
   C 62 89, 76 82, 89 76 \
   C 72 63, 61 48, 63 31 \
   C 65 17, 75 7, 87 8 \
   C 98 9, 104 20, 104 34 \
   C 104 49, 98 64, 93 79 \
   C 90 88, 89 96, 90 106 \
   C 89 93, 88 74, 88 56 \
   C 88 38, 89 21, 92 15 \
   C 95 9, 99 11, 101 18 \
   C 103 28, 102 43, 100 58 \
   C 98 79, 95 100, 92 121 \
   C 90 134, 88 141, 84 145 \
   C 82 147, 84 142, 90 132 \
   C 97 120, 106 104, 117 90 \
   C 118 78, 118 64, 120 52 \
   C 121 40, 125 31, 130 30 \
   C 135 29, 138 36, 138 47 \
   C 138 60, 135 73, 130 85 \
   C 126 93, 123 99, 122 107 \
   C 126 100, 132 95, 139 97 \
   C 145 99, 148 105, 146 111 \
   C 144 117, 139 120, 133 119 \
   C 128 118, 125 113, 126 108 \
   C 127 101, 134 97, 143 98 \
   C 148 94, 154 90, 159 91 \
   C 165 92, 169 98, 169 106 \
   C 169 117, 164 128, 159 139 \
   C 155 146, 153 152, 154 157 \
   C 155 161, 158 163, 161 162 \
   C 166 160, 168 152, 168 141 \
   C 168 126, 164 112, 159 98 \
   C 156 91, 152 84, 148 78 \
   C 156 86, 166 91, 175 95 \
   C 174 78, 174 61, 176 45 \
   C 178 30, 183 19, 190 17 \
   C 197 16, 201 23, 201 34 \
   C 201 48, 196 61, 190 74 \
   C 185 86, 181 99, 179 113 \
   C 177 126, 177 138, 179 147 \
   C 181 155, 185 160, 189 160 \
   C 194 159, 196 151, 196 139 \
   C 196 122, 192 105, 188 89 \
   C 192 92, 196 94, 200 95 \
   C 199 78, 200 60, 203 44 \
   C 206 28, 212 16, 219 13 \
   C 227 10, 231 17, 231 29 \
   C 231 43, 225 57, 218 71 \
   C 211 85, 206 100, 204 116 \
   C 202 132, 202 145, 204 155 \
   C 206 163, 210 168, 214 168 \
   C 220 167, 223 157, 223 143 \
   C 223 124, 218 105, 212 86 \
   C 216 84, 220 84, 223 86 \
   C 228 82, 234 79, 240 81 \
   C 245 83, 248 89, 247 95 \
   C 246 102, 241 107, 235 108 \
   C 229 109, 224 106, 223 100 \
   C 222 93, 227 86, 235 84 \
   C 243 82, 250 86, 252 93 \
   C 253 76, 256 58, 262 42 \
   C 268 25, 276 13, 284 11 \
   C 291 10, 296 16, 296 28 \
   C 296 43, 290 57, 284 70 \
   C 279 80, 276 89, 275 99 \
   C 275 106, 277 111, 281 113 \
   C 286 115, 290 112, 293 106 \
   C 296 99, 297 91, 297 82 \
   C 297 64, 298 46, 300 30 \
   C 302 20, 305 13, 309 12 \
   C 314 11, 318 16, 321 24 \
   C 325 36, 326 50, 326 65 \
   C 326 83, 325 100, 323 115 \
   C 326 107, 331 101, 335 101 \
   C 339 102, 341 108, 341 116 \
   C 341 123, 339 130, 337 137 \
   C 335 142, 334 146, 334 149 \
   C 337 146, 341 142, 346 139 \
   C 350 137, 354 138, 356 142 \
   C 358 147, 359 153, 359 158 \
   C 362 151, 366 143, 371 134 \
   C 377 123, 384 109, 392 95 \
   C 401 78, 411 60, 422 41 \
   C 432 24, 439 12, 444 4";

const TOTAL_MS = 3.6 * 1000;

export default function SignatureIntro() {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen")) return;
    sessionStorage.setItem("intro-seen", "1");
    setVisible(true);
    const t = setTimeout(dismiss, TOTAL_MS);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "#050818" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 450 170"
            width="700"
            className="w-[min(700px,94vw)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            overflow="visible"
          >
            <defs>
              <filter id="sig-glow" x="-30%" y="-40%" width="160%" height="200%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <motion.path
              d={SIGNATURE_PATH}
              stroke="#a78bfa"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.16}
              filter="url(#sig-glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.9, ease: "easeOut" }}
            />

            <motion.path
              d={SIGNATURE_PATH}
              stroke="white"
              strokeWidth="2.15"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.9, ease: "easeOut" }}
            />
          </svg>

          <motion.button
            onClick={dismiss}
            className="absolute bottom-10 text-xs text-white/25 hover:text-white/60 transition-colors tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}