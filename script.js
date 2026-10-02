let loadedVideoFile = null;

const ytUrlInput = document.getElementById('ytUrlInput');
const transcriptUrlInput = document.getElementById('transcriptUrlInput');
const videoFileInput = document.getElementById('videoFileInput');
const processBtn = document.getElementById('processBtn');
const resultArea = document.getElementById('resultArea');

function generateDynamicClips(totalDuration) {
    let clipCount = 2;
    if (totalDuration >= 60) clipCount = 3;
    if (totalDuration >= 120) clipCount = 4;

    const clips = [];
    const segmentLength = totalDuration / clipCount;

    const variations = [
        {
            type: "🔥 CLUTCH MOMENT",
            hl: "1 HP AND A DREAM 😱🔥",
            hv: "👀 Fast-cut zoom in to low health bar right before spraying down the entire enemy team.",
            hk: "No way I survive this... bro watch this clutch!",
            caption: "How did I even win this round?! Rate this play 1 to 10 in the comments 💀👇\n\n#clutch #outplay #gaming #viral #fyp #usa"
        },
        {
            type: "😂 FUNNY FAIL",
            hl: "BRO HAD ONE JOB 💀",
            hv: "🎬 Freeze frame reaction on teammate throwing a bad grenade with slow-mo effect.",
            hk: "Ain't no way he just did that... look at this guy!",
            caption: "Tag that one friend who always throws the game like this 😭👇\n\n#funny #fails #gamingmemes #memes #fyp"
        },
        {
            type: "🤯 INSANE PLAY",
            hl: "THE MOST STRESSFUL ROUND 🧠✨",
            hv: "🔥 Fast-cut highlight showing high-level tactical movement and reaction time.",
            hk: "Holy moly we were both freaking nervous there bro!",
            caption: "Would you have pushed or held the angle here? Drop your rank down below! 👇\n\n#gaming #highlight #gameplay #viral #fyp"
        }
    ];

    for (let i = 0; i < clipCount; i++) {
        let startSec = Math.floor(i * segmentLength);
        if (i > 0) startSec = Math.max(0, startSec - 2);
        
        let endSec = Math.floor((i + 1) * segmentLength);
        if (i === clipCount - 1) endSec = Math.floor(totalDuration);

        const durationSec = endSec - startSec;
        const v = variations[i % variations.length];

        const formatTime = (s) => {
            const mins = Math.floor(s / 60).toString().padStart(2, '0');
            const secs = (s % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };

        clips.push({
            clip_id: i + 1,
            moment_type: v.type,
            timestamp: {
                start_seconds: startSec,
                end_seconds: endSec,
                display: `${formatTime(startSec)} - ${formatTime(endSec)} (${durationSec} detik)`
            },
            headline_hook: v.hl,
            hook_visual: v.hv,
            hook_verbal: v.hk,
            caption: v.caption
        });
    }

    return clips;
}

if (videoFileInput) {
    videoFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            loadedVideoFile = e.target.files[0];
        }
    });
}

if (processBtn) {
    processBtn.addEventListener('click', async () => {
        const ytUrl = ytUrlInput ? ytUrlInput.value.trim() : '';
        const transcriptUrl = transcriptUrlInput ? transcriptUrlInput.value.trim() : '';
        
        if (!ytUrl && !loadedVideoFile) {
            alert("Harap masukkan Link YouTube atau pilih file video MP4!");
            return;
        }

        processBtn.disabled = true;
        processBtn.innerText = "⏳ Memproses Klip Target US/Global...";
        resultArea.innerHTML = '';

        if (transcriptUrl) {
            renderTranscriptBox(transcriptUrl);
        }

        if (loadedVideoFile) {
            const tempVideo = document.createElement('video');
            tempVideo.src = URL.createObjectURL(loadedVideoFile);

            tempVideo.onloadedmetadata = () => {
                const totalDuration = tempVideo.duration;
                const dynamicClips = generateDynamicClips(totalDuration);
                renderClips(dynamicClips);

                processBtn.disabled = false;
                processBtn.innerText = "⚡ PROSES KLIP & TRANSKRIP";
            };
        } else {
            let clipsToRender = [];
            try {
                const res = await fetch('database.json');
                if (!res.ok) throw new Error("Gagal mengunduh file JSON");
                const dbData = await res.json();
                clipsToRender = dbData.clips;
            } catch (err) {
                console.warn("Menggunakan data fallback:", err);
                clipsToRender = generateDynamicClips(30);
            }

            renderClips(clipsToRender);
            processBtn.disabled = false;
            processBtn.innerText = "⚡ PROSES KLIP & TRANSKRIP";
        }
    });
}

function renderTranscriptBox(url) {
    const html = `
        <div class="transcript-container">
            <strong>🔗 Link Transkrip Terhubung:</strong><br>
            <a href="${url}" target="_blank" style="color: #38bdf8;">${url}</a>
        </div>
    `;
    resultArea.innerHTML += html;
}

function renderClips(clips) {
    clips.forEach(clip => {
        const card = document.createElement('div');
        card.className = 'clip-card';

        card.innerHTML = `
            <div class="clip-meta">
                <span class="badge-id">KLIP #${clip.clip_id}</span>
                <span class="badge-time">⏱ DETIK: ${clip.timestamp.display}</span>
            </div>

            <span class="label-title">⏳ TIMESTAMP:</span>
            <div class="box-content">Detik ${clip.timestamp.start_seconds} s/d Detik ${clip.timestamp.end_seconds}</div>

            <span class="label-title">📌 HEADLINE HOOK (ACUAN):</span>
            <div class="box-content headline-text" id="hl_${clip.clip_id}">${clip.headline_hook}</div>
            <button class="btn-copy" onclick="copyText('hl_${clip.clip_id}', this)">Copy Headline Hook</button>

            <span class="label-title">👀 HOOK VISUAL (ADEGAN/AKSI):</span>
            <div class="box-content" id="hv_${clip.clip_id}">${clip.hook_visual}</div>
            <button class="btn-copy" onclick="copyText('hv_${clip.clip_id}', this)">Copy Hook Visual</button>

            <span class="label-title">🗣️ HOOK LISAN (UCAPAN):</span>
            <div class="box-content" id="hk_${clip.clip_id}">${clip.hook_verbal}</div>
            <button class="btn-copy" onclick="copyText('hk_${clip.clip_id}', this)">Copy Hook Lisan</button>

            <span class="label-title">📝 CAPTION POSTINGAN:</span>
            <div class="box-content" id="cp_${clip.clip_id}">${clip.caption}</div>
            <button class="btn-copy" onclick="copyText('cp_${clip.clip_id}', this)">Copy Caption</button>

            <button class="btn-download" id="dl_btn_${clip.clip_id}" onclick="downloadClipNative(${clip.clip_id}, ${clip.timestamp.start_seconds}, ${clip.timestamp.end_seconds})">
                🎬 GENERATE & TAMPILKAN VIDEO KLIP #${clip.clip_id}
            </button>
            
            <div id="video_preview_area_${clip.clip_id}" style="margin-top: 15px;"></div>
        `;

        resultArea.appendChild(card);
    });
}

// PEMOTONG VIDEO BROWSER NATIVE (FORCE DATA-URL FOR MOBILE DOWNLOAD)
async function downloadClipNative(clipId, startSec, endSec) {
    const btn = document.getElementById(`dl_btn_${clipId}`);
    const previewArea = document.getElementById(`video_preview_area_${clipId}`);

    if (!loadedVideoFile) {
        alert("Silakan Upload file MP4 lokal terlebih dahulu di bagian atas!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "⏳ Memproses Pemotongan Klip...";
    previewArea.innerHTML = '';

    const videoEl = document.createElement('video');
    videoEl.src = URL.createObjectURL(loadedVideoFile);
    videoEl.muted = false;
    videoEl.playsInline = true;

    await new Promise((resolve) => {
        videoEl.onloadedmetadata = () => resolve();
    });

    videoEl.currentTime = startSec;

    await new Promise((resolve) => {
        videoEl.onseeked = () => resolve();
    });

    const stream = videoEl.captureStream ? videoEl.captureStream() : videoEl.mozCaptureStream();
    
    let mimeType = 'video/mp4;codecs=avc1,aac';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const fileType = mimeType.includes('mp4') ? 'video/mp4' : 'video/webm';
        const rawBlob = new Blob(chunks, { type: fileType });

        const blobUrl = URL.createObjectURL(rawBlob);
        const customFileName = `Klip_${clipId}_detik_${startSec}_sampai_${endSec}.${ext}`;

        // Konversi Blob ke Data URL agar browser HP membaca nama file secara eksplisit
        const reader = new FileReader();
        reader.readAsDataURL(rawBlob);
        reader.onloadend = () => {
            const dataUrl = reader.result;

            previewArea.innerHTML = `
                <div style="background: #1e293b; padding: 12px; border-radius: 10px; border: 1px solid #334155; text-align: center;">
                    <p style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-bottom: 8px;">
                        ✅ Klip Selesai Dipotong!
                    </p>
                    <video controls playsinline src="${blobUrl}" style="width: 100%; max-height: 300px; border-radius: 8px; background: #000;"></video>
                    
                    <a href="${dataUrl}" download="${customFileName}" style="display: inline-block; width: 100%; margin-top: 10px; padding: 12px 0; background: #22c55e; color: #ffffff; font-weight: bold; font-size: 13px; border-radius: 6px; text-decoration: none;">
                        📥 DOWNLOAD ${customFileName}
                    </a>

                    <p style="color: #94a3b8; font-size: 11px; margin-top: 8px;">
                        💡 Klik tombol hijau di atas untuk menyimpan file dengan nama rapi.
                    </p>
                </div>
            `;

            btn.disabled = false;
            btn.innerText = `🔄 POTONG ULANG KLIP #${clipId}`;
        };
    };

    mediaRecorder.start();
    await videoEl.play();

    const durationMs = (endSec - startSec) * 1000;
    setTimeout(() => {
        mediaRecorder.stop();
        videoEl.pause();
    }, durationMs);
}

function copyText(elementId, btn) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "✅ Copied!";
        btn.style.backgroundColor = "#16a34a";
        btn.style.color = "#fff";

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "#1e293b";
            btn.style.color = "#94a3b8";
        }, 1500);
    });
}
