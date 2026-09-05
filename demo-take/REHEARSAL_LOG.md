### 2026-09-05 — Assay demo v1 → v2
- **Issue:** delivered cut had 100s of dead air — audio died at 21s, silence for the rest. He suspected the mux.
- **Root cause:** NOT the mux. The beat-split script used OUTPUT seek (-ss after -i) plus absolute-time afade filters; on the seeked timeline the fade-out st landed inside the whole clip, so beats 2-7 rendered fully faded (silenced) WAVs. Mux faithfully muxed silent beats.
- **Fix:** re-cut beats 2-7 with INPUT seek (-ss before -i), no filters; volumedetect every beat (-21 to -23 dB); re-ran scene-mux. Final: one 1.07s breath pause remains (legit paragraph break).
- **Time lost:** one full review cycle + re-render of the VO that was never needed (MiniMax wav was fine).

**Rule:** after any ffmpeg cut with filter chains, volumedetect EVERY cut file before it enters the pipeline.
