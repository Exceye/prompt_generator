/**
 * AI Prompt Generator Engine
 * Berdasarkan Master JSON Template Kategori Character Pose Transformation
 */

// 1. Template Dasar Lengkap
const BASE_PROMPT_TEMPLATE = {
  task: "Transform the subject in the input image into the specified reference pose and camera perspective while preserving the subject's original visual identity, design, outfit, accessories, props, materials, textures, colors, proportions, and visual style. The final subject must be completely visible inside the frame with zero unintended cropping and rendered as a high-resolution 8K transparent PNG.",

  input_image: {
    role: "The input image is the ONLY source of the subject's identity, appearance, outfit, accessories, props, colors, materials, textures, proportions, and visual style.",
    reference_usage: "The reference pose is used ONLY to determine body positioning, hand positioning, camera perspective, lens behavior, framing logic, and lighting direction.",
    restriction: "Do not copy the reference subject's appearance, clothing, hairstyle, colors, identity, or visual design."
  },

  primary_transformation: {
    change_only: [
      "body pose",
      "arm position",
      "hand position",
      "head orientation",
      "body lean",
      "camera position",
      "camera angle",
      "camera distance",
      "camera focal length",
      "perspective",
      "composition",
      "framing",
      "lighting"
    ],
    preserve_everything_else: true
  },

  pose_reference: {
    description: "",
    body: {
      stance: "",
      torso: "Tilt and lean the torso forward toward the camera.",
      hips: "Keep the hips and lower body farther away from the camera than the upper body.",
      legs: "Maintain a natural standing stance with the legs positioned farther from the camera.",
      overall_depth: "Create a strong depth hierarchy: hands closest to camera, face behind the hands, torso behind the face, legs farthest from camera."
    },
    head: {
      position: "Place the head approximately between the two extended arms.",
      orientation: "Face the camera directly or nearly directly.",
      gaze: "",
      priority: "Keep the face clearly visible and recognizable."
    },
    arms: {
      left_arm: {
        position: "Extend forward toward the camera from the subject's left side.",
        direction: "Forward and slightly upward toward the lens.",
        depth: "The hand must be significantly closer to the camera than the face."
      },
      right_arm: {
        position: "Extend forward toward the camera from the subject's right side.",
        direction: "Forward and slightly upward toward the lens.",
        depth: "The hand must be significantly closer to the camera than the face."
      },
      natural_variation: "The two arms do not need to be perfectly symmetrical. Preserve natural differences in height, angle, elbow position, and perspective."
    },
    hands: {
      importance: "EXTREMELY HIGH",
      description: "",
      scale: "Hands should appear significantly larger than the head and torso because of their physical proximity to the lens.",
      position: "Place one hand toward the upper-left foreground and the other toward the right foreground, visually surrounding or framing the face.",
      fingers: "Keep fingers naturally spread, articulated, and anatomically believable.",
      perspective: "The fingers and hands closest to the lens should appear dramatically enlarged compared with distant body parts.",
      anatomy: "Preserve the original subject's hand anatomy and design.",
      occlusion: "Hands may overlap the subject's body or partially overlap the edges of the composition, but NO hand, finger, or important detail may be cropped by the final image boundary.",
      depth_priority: "Hands are the closest major elements to the camera."
    }
  },

  camera: {
    importance: "EXTREMELY HIGH",
    position: {
      relative_to_subject: "",
      height: "Camera positioned higher than the subject's head.",
      direction: "Camera points downward toward the subject.",
      vertical_angle: "Approximately 20 to 35 degrees downward-facing perspective, adjusted according to the subject's anatomy and composition."
    },
    distance: {
      base: "Use a very close camera distance relative to the extended hands.",
      adaptive_rule: "Automatically increase camera distance whenever necessary to ensure the entire subject, both hands, all fingers, feet, shoes, accessories, and props remain completely inside the frame.",
      priority: "Complete subject visibility takes priority over extreme camera closeness.",
      restriction: "Do not solve framing problems by cropping the subject."
    },
    lens: {
      type: "Wide-angle or ultra-wide-angle",
      equivalent_focal_length: "18mm",
      purpose: "Create strong perspective exaggeration between the foreground hands and distant lower body."
    },
    perspective: {
      type: "Strong natural perspective projection.",
      foreground_effect: "Hands and fingers closest to the lens become dramatically larger.",
      midground_effect: "Face and torso remain proportionally smaller than the hands.",
      background_effect: "Legs and feet appear smaller because they are farther from the camera.",
      distortion: "Use natural wide-angle perspective distortion without creating unnatural facial deformation or anatomically impossible limbs."
    }
  },

  full_subject_framing: {
    importance: "ABSOLUTE",
    rule: "The entire subject must fit completely inside the image frame.",
    must_be_fully_visible: [
      "entire head", "entire hair", "both arms", "both hands", "every finger",
      "entire torso", "entire outfit", "all accessories", "all props",
      "both legs", "both feet", "shoes", "any object physically attached to or carried by the subject"
    ],
    cropping: {
      allowed: false,
      maximum: "ZERO unintended cropping.",
      rule: "No body part, finger, hand, foot, shoe, hair, accessory, clothing edge, or prop may touch or be cut by the image boundary."
    },
    safety_margin: {
      enabled: true,
      description: "Maintain a visible breathing room around the entire silhouette.",
      minimum_margin: "Keep a small but clearly visible transparent margin between every part of the subject and the image boundary.",
      hands: "Even the fingertips closest to the frame edges must remain completely visible with additional safety margin.",
      feet: "Leave visible space below the feet and shoes.",
      hair: "Do not allow hair or hair accessories to touch the frame edge.",
      props: "Large props must also have enough space to remain completely visible."
    },
    adaptive_composition: {
      enabled: true,
      rule: "If the subject or its props are too large for the initial composition, automatically adjust camera distance, camera elevation, focal length, or subject placement until the entire subject fits inside the frame.",
      priority_order: [
        "complete subject visibility",
        "preserve pose",
        "preserve perspective effect",
        "preserve visual composition"
      ]
    }
  },

  composition: {
    orientation: "Vertical portrait composition.",
    subject_alignment: "Keep the subject approximately centered within the frame.",
    face_position: "Keep the face near the central visual area.",
    hands_position: "Place the hands prominently in the foreground near the upper-left and right regions.",
    body_visibility: "Full body must be visible from the highest point of the subject to the lowest point of the feet or props.",
    negative_space: "Maintain sufficient transparent space around the entire silhouette.",
    balance: "The composition should feel intentional and balanced while preserving the dramatic close-perspective effect."
  },

  lighting: {
    style: "Bright high-key studio lighting.",
    key_light: "Large soft diffused light positioned above and in front of the subject.",
    fill_light: "Soft frontal fill light.",
    shadows: "Soft and subtle shadows with smooth tonal transitions.",
    contrast: "Moderate to low contrast.",
    preservation: "Lighting must not change or reinterpret the original subject's colors, materials, textures, patterns, or surface details."
  },

  background: {
    type: "Transparent",
    format: "PNG with alpha channel",
    transparency: "True transparent background with full alpha transparency.",
    rule: "Do not generate a white, gray, colored, gradient, studio, or simulated background.",
    edge_quality: "Clean, precise subject cutout with natural anti-aliased edges.",
    hair_edges: "Preserve fine hair strands and delicate silhouette details without creating white halos.",
    semi_transparent_details: "Preserve appropriate natural transparency where physically relevant, without introducing artificial outlines."
  },

  output: {
    resolution: "8K",
    minimum_target: "7680 pixels on the longest dimension.",
    quality: "Ultra-high-resolution, extremely detailed, clean and sharp.",
    format: "PNG",
    alpha_channel: true,
    background: "Transparent",
    detail_preservation: "Preserve maximum fine detail from the original input."
  },

  identity_and_design_preservation: {
    priority: "ABSOLUTE",
    preserve: [
      "original character identity", "facial structure", "hair", "skin or body material",
      "original outfit", "every clothing layer", "fabric texture", "patterns", "logos",
      "seams", "buttons", "zippers", "straps", "belts", "shoes", "gloves", "jewelry",
      "accessories", "props", "weapons", "bags", "mechanical details", "colors",
      "materials", "surface details", "original proportions", "original art style", "original rendering style"
    ],
    rule: "Do not redesign, simplify, recolor, replace, remove, or add any element belonging to the original subject.",
    texture_rule: "Preserve the original texture, material, surface characteristics, patterns, and micro-details.",
    style_rule: "If the input is photorealistic, remain photorealistic. If it is anime, remain anime. If it is a 3D game character, remain 3D. If it is an illustration, remain an illustration. Do not convert the visual medium.",
    prop_rule: "All original props must remain present and visually faithful. Their position may change only as physically necessary to accommodate the new pose."
  },

  anatomical_consistency: {
    rule: "Perspective exaggeration must be created primarily through camera placement, lens behavior, and physical depth rather than artificial body deformation.",
    hands: "Maintain correct number of fingers and believable anatomy.",
    limbs: "Do not stretch, duplicate, shorten, or deform limbs unnaturally.",
    joints: "Maintain physically believable shoulder, elbow, wrist, hip, knee, and ankle articulation.",
    face: "Avoid excessive facial distortion caused by the wide-angle lens.",
    balance: "Maintain physically believable body weight distribution and posture."
  },

  perspective_priority: {
    level: "EXTREME",
    desired_relationship: {
      hands: "closest and largest",
      face: "middle distance",
      torso: "behind face",
      hips: "farther away",
      legs: "smaller and farther away",
      feet: "farthest from camera"
    },
    important_rule: "The exaggerated size difference must result from authentic camera perspective and spatial depth, not from manually resizing body parts."
  },

  quality_control: {
    before_final_output: [
      "Verify that the complete subject is inside the frame.",
      "Verify that both hands are fully visible.",
      "Verify that every finger is fully visible.",
      "Verify that both feet and shoes are fully visible.",
      "Verify that all accessories and props are fully visible.",
      "Verify that no important detail touches or crosses the frame boundary.",
      "Verify that the wide-angle perspective remains strong.",
      "Verify that the original outfit remains unchanged.",
      "Verify that original textures and materials remain unchanged.",
      "Verify that the subject identity remains unchanged.",
      "Verify that the background is genuinely transparent.",
      "Verify that the PNG contains an alpha channel.",
      "Verify that the final output is rendered at 8K resolution."
    ]
  },

  negative_prompt: [
    "cropped subject", "cropped hands", "cropped fingers", "cropped feet", "cropped shoes",
    "cropped hair", "cropped accessories", "cropped props", "body touching frame edge",
    "fingertips touching frame edge", "missing body parts", "missing fingers", "extra fingers",
    "extra limbs", "deformed anatomy", "artificially enlarged hands", "flat perspective",
    "telephoto perspective", "normal eye-level camera", "weak perspective", "outfit redesign",
    "outfit color change", "texture change", "accessory removal", "accessory addition",
    "character redesign", "style conversion", "white background", "gray background",
    "colored background", "gradient background", "fake transparent background", "white halo",
    "background artifacts", "low resolution", "blurry details", "pixelated details"
  ],

  final_instruction: ""
};

// State Aplikasi
let currentJsonObject = null;

// DOM Elements
const focalInput = document.getElementById('focal-length');
const focalVal = document.getElementById('focal-val');
const btnBasicMode = document.getElementById('btn-basic-mode');
const btnAdvancedMode = document.getElementById('btn-advanced-mode');
const advancedFields = document.getElementById('advanced-fields');

const btnViewJson = document.getElementById('btn-view-json');
const btnViewText = document.getElementById('btn-view-text');
const displayJson = document.getElementById('output-display-json');
const displayText = document.getElementById('output-display-text');

const btnGenerate = document.getElementById('btn-generate');
const btnReset = document.getElementById('btn-reset');
const btnCopyJson = document.getElementById('btn-copy-json');
const btnCopyText = document.getElementById('btn-copy-text');
const btnDownloadJson = document.getElementById('btn-download-json');
const btnDownloadTxt = document.getElementById('btn-download-txt');
const toastMsg = document.getElementById('toast-msg');

// Initial Events & Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load local storage if available
  loadSavedConfig();
  
  // Real-time slider update
  focalInput.addEventListener('input', (e) => {
    focalVal.textContent = `${e.target.value}mm`;
    buildAndRenderPrompt();
  });

  // Switch Modes (Basic / Advanced)
  btnBasicMode.addEventListener('click', () => {
    btnBasicMode.classList.add('active');
    btnAdvancedMode.classList.remove('active');
    advancedFields.classList.add('hidden');
  });

  btnAdvancedMode.addEventListener('click', () => {
    btnAdvancedMode.classList.add('active');
    btnBasicMode.classList.remove('active');
    advancedFields.classList.remove('hidden');
  });

  // Switch Views (JSON / Text)
  btnViewJson.addEventListener('click', () => {
    btnViewJson.classList.add('active');
    btnViewText.classList.remove('active');
    displayJson.classList.remove('hidden');
    displayText.classList.add('hidden');
  });

  btnViewText.addEventListener('click', () => {
    btnViewText.classList.add('active');
    btnViewJson.classList.remove('active');
    displayText.classList.remove('hidden');
    displayJson.classList.add('hidden');
  });

  // Action Buttons
  btnGenerate.addEventListener('click', () => {
    buildAndRenderPrompt();
    showToast("Prompt berhasil diproses!");
  });

  btnReset.addEventListener('click', resetForm);
  btnCopyJson.addEventListener('click', () => copyToClipboard(JSON.stringify(currentJsonObject, null, 2), "JSON berhasil disalin!"));
  btnCopyText.addEventListener('click', () => copyToClipboard(generatePlainText(currentJsonObject), "Prompt Teks berhasil disalin!"));
  btnDownloadJson.addEventListener('click', () => downloadFile(JSON.stringify(currentJsonObject, null, 2), 'prompt_transformation.json', 'application/json'));
  btnDownloadTxt.addEventListener('click', () => downloadFile(generatePlainText(currentJsonObject), 'prompt_transformation.txt', 'text/plain'));

  // Initial build
  buildAndRenderPrompt();
});

// Fungsi Utama Membangun Object JSON Terstruktur
function buildAndRenderPrompt() {
  // Deep Clone Template Utama
  const result = JSON.parse(JSON.stringify(BASE_PROMPT_TEMPLATE));

  // 1. Task & Pose
  result.task = document.getElementById('task-desc').value.trim();
  result.pose_reference.description = document.getElementById('pose-desc').value.trim();
  result.pose_reference.body.stance = document.getElementById('body-stance').value.trim();
  result.pose_reference.head.gaze = document.getElementById('head-gaze').value;
  result.pose_reference.hands.importance = document.getElementById('hands-importance').value;
  result.pose_reference.hands.description = document.getElementById('hands-desc').value.trim();

  // 2. Camera & Lens
  const focalValue = focalInput.value;
  result.camera.lens.equivalent_focal_length = `${focalValue}mm full-frame equivalent`;
  result.camera.position.relative_to_subject = document.getElementById('camera-height').value;

  // 3. Framing Options
  const isFullFraming = document.getElementById('full-subject-framing').checked;
  result.full_subject_framing.cropping.allowed = !isFullFraming;
  result.full_subject_framing.adaptive_composition.enabled = document.getElementById('adaptive-distance').checked;

  // 4. Lighting & Background
  result.lighting.style = document.getElementById('lighting-style').value;
  const bgChoice = document.getElementById('bg-type').value;
  result.background.type = bgChoice;
  result.background.format = bgChoice === "Transparent" ? "PNG with alpha channel" : "JPG/PNG";

  // 5. Output
  const resChoice = document.getElementById('output-res').value;
  result.output.resolution = resChoice;
  result.output.minimum_target = resChoice === "8K" ? "7680 pixels" : resChoice === "4K" ? "3840 pixels" : "2048 pixels";

  // 6. Advanced Fields
  result.identity_and_design_preservation.priority = document.getElementById('identity-preservation').value;

  const customNeg = document.getElementById('negative-prompt-custom').value.trim();
  if (customNeg) {
    const extraNegs = customNeg.split(',').map(s => s.trim()).filter(s => s.length > 0);
    result.negative_prompt = [...new Set([...result.negative_prompt, ...extraNegs])];
  }

  result.final_instruction = document.getElementById('final-instruction-custom').value.trim();

  // Save State & Render
  currentJsonObject = result;
  displayJson.textContent = JSON.stringify(result, null, 2);
  displayText.textContent = generatePlainText(result);

  // Auto-save to LocalStorage
  saveConfigToLocal();
}

// Konversi JSON ke Teks Narasi Biasa
function generatePlainText(json) {
  if (!json) return "";
  return `TASK:
${json.task}

POSE & CAMERA:
${json.pose_reference.description}
Stance: ${json.pose_reference.body.stance}
Camera: ${json.camera.position.relative_to_subject} (Lens: ${json.camera.lens.equivalent_focal_length}).

FULL FRAMING & ACCURACY:
Framing Rule: ${json.full_subject_framing.rule}
Allowed Cropping: ${json.full_subject_framing.cropping.maximum}

LIGHTING & BACKGROUND:
Lighting: ${json.lighting.style}
Background: ${json.background.type} (${json.background.format}).
Output Resolution: ${json.output.resolution} (${json.output.minimum_target}).

NEGATIVE PROMPT:
${json.negative_prompt.join(', ')}

FINAL INSTRUCTION:
${json.final_instruction}`;
}

// Fungsi Clipboard
function copyToClipboard(text, message) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(message);
  }).catch(err => {
    alert("Gagal menyalin teks: " + err);
  });
}

// Fungsi Download File
function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Toast Notification
function showToast(msg) {
  toastMsg.textContent = msg;
  toastMsg.classList.remove('hidden');
  setTimeout(() => {
    toastMsg.classList.add('hidden');
  }, 2500);
}

// Reset Form
function resetForm() {
  localStorage.removeItem('ai_prompt_generator_config');
  location.reload();
}

// Local Storage Persistence
function saveConfigToLocal() {
  const configData = {
    taskDesc: document.getElementById('task-desc').value,
    poseDesc: document.getElementById('pose-desc').value,
    focal: focalInput.value,
    bgType: document.getElementById('bg-type').value,
    outputRes: document.getElementById('output-res').value
  };
  localStorage.setItem('ai_prompt_generator_config', JSON.stringify(configData));
}

function loadSavedConfig() {
  const saved = localStorage.getItem('ai_prompt_generator_config');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.taskDesc) document.getElementById('task-desc').value = data.taskDesc;
      if (data.poseDesc) document.getElementById('pose-desc').value = data.poseDesc;
      if (data.focal) {
        focalInput.value = data.focal;
        focalVal.textContent = `${data.focal}mm`;
      }
      if (data.bgType) document.getElementById('bg-type').value = data.bgType;
      if (data.outputRes) document.getElementById('output-res').value = data.outputRes;
    } catch (e) {
      console.error("Gagal membaca local storage", e);
    }
  }
}
