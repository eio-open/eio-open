# Star1s Software Development Guide

Star1s is built on Android 9 AOSP system. This document includes example codes for the following:
Event Key Listening
Camera APIs
Microphone APIs
Speaker APIs

## Event Key Listening
Key Definition:

Android Code:

```
package com.example.keyeventdemo;

```
import android.os.Bundle;
```
import android.view.KeyEvent;
```
import android.widget.Toast;
```
import androidx.appcompat.app.AppCompatActivity;

```
public class MainActivity extends AppCompatActivity {

// Define Keys
```
    public static final int KEY_RIGHT = 106;   // 0x6a
```
    public static final int KEY_LEFT = 105;    // 0x69
```
    public static final int KEY_OK = 352;      // 0x160
```
public static final int KEY_BACK = 158;    // 0x9e
```
public static final int KEY_POWER = 164;  // 0x74

    @Override
```
    protected void onCreate(Bundle savedInstanceState) {
```
        super.onCreate(savedInstanceState);
```
        setContentView(R.layout.activity_main);
```
    }

    @Override
```
    public boolean dispatchKeyEvent(KeyEvent event) {
```
        int keyCode = event.getKeyCode();
```
        int action = event.getAction();
```
        if (action == KeyEvent.ACTION_DOWN) {
```
            switch (keyCode) {
                case KEY_LEFT:
```
                    showToast("Left pressed");
```
                    return true;
                case KEY_RIGHT:
```
                    showToast("Right pressed");
```
                    return true;
                case KEY_OK:
```
                    showToast("Confirm pressed");
```
                    return true;
                case KEY_BACK:
```
                    showToast("Return pressed");
```
                    super.onBackPressed();
```
                    return true;
```
            }
```
        }

        // Leave other key event to system
```
        return super.dispatchKeyEvent(event);
```
    }

```
    private void showToast(String message) {
```
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
```
    }
```
}

## Camera APIs
You can bring up the camera with the CameraX api.

Example Project as follows:

build.gradle:
// app/build.gradle
```
plugins {
    id 'com.android.application'
    id 'kotlin-android'
```
}

```
android {
    compileSdk 33
```
    defaultConfig {
        applicationId "com.example.cameraximageview"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "1.0"
```
    }
```
    buildFeatures {
        viewBinding true
```
    }
```
}
```
dependencies {
    implementation "androidx.core:core-ktx:1.12.0"
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "com.google.android.material:material:1.9.0"
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    // CameraX
```
    def camerax_version = "1.3.0"
    implementation "androidx.camera:camera-core:$camerax_version"
    implementation "androidx.camera:camera-camera2:$camerax_version"
    implementation "androidx.camera:camera-lifecycle:$camerax_version"
    implementation "androidx.camera:camera-view:$camerax_version"
```
}

AndroidManifest.xml:
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.cameraximageview">

```
    <uses-permission android:name="android.permission.CAMERA"/>
```
    <uses-feature android:name="android.hardware.camera.any" />

    <application
```
        android:allowBackup="true"
```
        android:label="CameraXImageView"
```
        android:theme="@style/Theme.AppCompat.Light.DarkActionBar">
```
        <activity android:name=".MainActivity"
```
            android:exported="true">
            <intent-filter>
```
                <action android:name="android.intent.action.MAIN" />
```
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>

activity_main.xml:

<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
```
    android:layout_width="match_parent"
```
    android:layout_height="match_parent">
    <androidx.camera.view.PreviewView
```
        android:id="@+id/previewView"
```
        android:layout_width="0dp"
```
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toTopOf="@+id/toggleButton"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"/>
    <Button
```
        android:id="@+id/toggleButton"
```
        android:layout_width="wrap_content"
```
        android:layout_height="wrap_content"
```
        android:text="close view"
        app:layout_constraintTop_toBottomOf="@id/previewView"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"/>
</androidx.constraintlayout.widget.ConstraintLayout>

MainActivity.kt:

```
package com.example.cameraximageview
```
import android.Manifest
```
import android.content.pm.PackageManager
```
import android.os.Bundle
```
import android.widget.Button
```
import androidx.appcompat.app.AppCompatActivity
```
import androidx.camera.core.CameraSelector
```
import androidx.camera.core.Preview
```
import androidx.camera.lifecycle.ProcessCameraProvider
```
import androidx.core.app.ActivityCompat
```
import androidx.core.content.ContextCompat
```
import com.example.cameraximageview.databinding.ActivityMainBinding

```
class MainActivity : AppCompatActivity() {
```
    private lateinit var binding: ActivityMainBinding
```
    private var cameraProvider: ProcessCameraProvider? = null
```
    private var isCameraOn = true
```
    companion object {
```
        private const val PERMISSION_REQUEST_CAMERA = 10
```
    }
```
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
```
        if (allPermissionsGranted()) {
            startCamera()
```
        } else {
            ActivityCompat.requestPermissions(this,
                arrayOf(Manifest.permission.CAMERA),
                PERMISSION_REQUEST_CAMERA)
```
        }
```
        binding.toggleButton.setOnClickListener {
            isCameraOn = !isCameraOn
```
            if (isCameraOn) {
                binding.previewView.visibility = android.view.View.VISIBLE
                startCamera()
                binding.toggleButton.text = "close view"
```
            } else {
                binding.previewView.visibility = android.view.View.INVISIBLE
                stopCamera()
                binding.toggleButton.text = "open view"
```
            }
```
        }
```
    }
```
    private fun allPermissionsGranted(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED
```
    }
```
    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
```
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
```
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
```
            }
            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            cameraProvider?.unbindAll()
            cameraProvider?.bindToLifecycle(this, cameraSelector, preview)
```
        }, ContextCompat.getMainExecutor(this))
```
    }
```
    private fun stopCamera() {
        cameraProvider?.unbindAll()
```
    }
    override fun onRequestPermissionsResult(
```
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
```
        if (requestCode == PERMISSION_REQUEST_CAMERA) {
```
            if (allPermissionsGranted()) {
                startCamera()
```
            } else {
                finish() // permisison refused
```
            }
```
        }
```
    }
```
}

## Microphone APIs
AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.microphonetest">

```
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
```
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
```
        android:allowBackup="true"
```
        android:icon="@mipmap/ic_launcher"
```
        android:label="@string/app_name"
```
        android:roundIcon="@mipmap/ic_launcher_round"
```
        android:supportsRtl="true"
```
        android:theme="@style/AppTheme">
```
        <activity android:name=".MainActivity">
            <intent-filter>
```
                <action android:name="android.intent.action.MAIN" />
```
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>

activity_main.xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
```
    android:layout_width="match_parent"
```
    android:layout_height="match_parent"
```
    android:orientation="vertical"
```
    android:padding="16dp"
```
    android:gravity="center">

    <Button
```
        android:id="@+id/btnRecord"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:text="start recording"
```
        android:textSize="18sp"
```
        android:layout_marginBottom="16dp"/>

    <Button
```
        android:id="@+id/btnStop"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:text="stop recording"
```
        android:textSize="18sp"
```
        android:layout_marginBottom="16dp"/>

    <Button
```
        android:id="@+id/btnPlay"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:text="play recording"
```
        android:textSize="18sp"/>
</LinearLayout>

MainActivity.java

```
package com.example.microphonetest;

```
import androidx.annotation.NonNull;
```
import androidx.appcompat.app.AppCompatActivity;
```
import androidx.core.app.ActivityCompat;
```
import androidx.core.content.ContextCompat;

```
import android.Manifest;
```
import android.content.pm.PackageManager;
```
import android.media.MediaPlayer;
```
import android.media.MediaRecorder;
```
import android.os.Bundle;
```
import android.os.Environment;
```
import android.view.View;
```
import android.widget.Button;
```
import android.widget.Toast;

```
import java.io.IOException;
```
import java.text.SimpleDateFormat;
```
import java.util.Date;
```
import java.util.Locale;

```
public class MainActivity extends AppCompatActivity {

```
    private static final int REQUEST_RECORD_AUDIO_PERMISSION = 200;
```
    private static final String LOG_TAG = "AudioRecordTest";
```
    private String fileName = null;

```
    private Button recordButton, stopButton, playButton;
```
    private MediaRecorder recorder = null;
```
    private MediaPlayer player = null;

```
    private boolean permissionToRecordAccepted = false;
```
    private String[] permissions = {Manifest.permission.RECORD_AUDIO,
```
            Manifest.permission.WRITE_EXTERNAL_STORAGE};

    @Override
```
    protected void onCreate(Bundle savedInstanceState) {
```
        super.onCreate(savedInstanceState);
```
        setContentView(R.layout.activity_main);

```
        fileName = getExternalCacheDir().getAbsolutePath();
```
        fileName += "/audiorecordtest.3gp";

```
        recordButton = findViewById(R.id.btnRecord);
```
        stopButton = findViewById(R.id.btnStop);
```
        playButton = findViewById(R.id.btnPlay);

```
        stopButton.setEnabled(false);
```
        playButton.setEnabled(false);


```
        ActivityCompat.requestPermissions(this, permissions, REQUEST_RECORD_AUDIO_PERMISSION);

```
        recordButton.setOnClickListener(new View.OnClickListener() {
            @Override
```
            public void onClick(View v) {
```
                startRecording();
```
            }
```
        });

```
        stopButton.setOnClickListener(new View.OnClickListener() {
            @Override
```
            public void onClick(View v) {
```
                stopRecording();
```
            }
```
        });

```
        playButton.setOnClickListener(new View.OnClickListener() {
            @Override
```
            public void onClick(View v) {
```
                startPlaying();
```
            }
```
        });
```
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
```
                                           @NonNull int[] grantResults) {
```
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
```
        switch (requestCode) {
            case REQUEST_RECORD_AUDIO_PERMISSION:
```
                permissionToRecordAccepted = grantResults[0] == PackageManager.PERMISSION_GRANTED;
```
                break;
```
        }
```
        if (!permissionToRecordAccepted) finish();
```
    }

```
    private void startRecording() {
```
        recorder = new MediaRecorder();
```
        recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
```
        recorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
```
        recorder.setOutputFile(fileName);
```
        recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

```
        try {
```
            recorder.prepare();
```
        } catch (IOException e) {
```
            e.printStackTrace();
```
        }

```
        recorder.start();
```
        recordButton.setEnabled(false);
```
        stopButton.setEnabled(true);
```
        playButton.setEnabled(false);
```
        Toast.makeText(this, "start recording", Toast.LENGTH_SHORT).show();
```
    }

```
    private void stopRecording() {
```
        if (recorder != null) {
```
            recorder.stop();
```
            recorder.release();
```
            recorder = null;
```
            recordButton.setEnabled(true);
```
            stopButton.setEnabled(false);
```
            playButton.setEnabled(true);
```
            Toast.makeText(this, "record saved", Toast.LENGTH_SHORT).show();
```
        }
```
    }

```
    private void startPlaying() {
```
        player = new MediaPlayer();
```
        try {
```
            player.setDataSource(fileName);
```
            player.prepare();
```
            player.start();
```
            recordButton.setEnabled(false);
```
            stopButton.setEnabled(false);
```
            playButton.setEnabled(false);

```
            player.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
```
                public void onCompletion(MediaPlayer mp) {
```
                    releasePlayer();
```
                    recordButton.setEnabled(true);
```
                    playButton.setEnabled(true);
```
                    Toast.makeText(MainActivity.this, "finished playing", Toast.LENGTH_SHORT).show();
```
                }
```
            });
```
            Toast.makeText(this, "start playing", Toast.LENGTH_SHORT).show();
```
        } catch (IOException e) {
```
            e.printStackTrace();
```
            Toast.makeText(this, "play failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
```
        }
```
    }

```
    private void releasePlayer() {
```
        if (player != null) {
```
            player.release();
```
            player = null;
```
        }
```
    }

    @Override
```
    protected void onStop() {
```
        super.onStop();
```
        if (recorder != null) {
```
            recorder.release();
```
            recorder = null;
```
        }
```
        releasePlayer();
```
    }
```
}



## Speaker APIs
Example code for speaker.

AndroidManifest.xml:
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
```
    android:layout_width="match_parent"
```
    android:layout_height="match_parent"
```
    android:orientation="vertical"
```
    android:padding="16dp"
```
    android:gravity="center_horizontal"
```
    android:background="#f5f5f5">

    <ImageView
```
        android:layout_width="120dp"
```
        android:layout_height="120dp"
```
        android:src="@android:drawable/ic_btn_speak_now"
```
        android:layout_gravity="center"
```
        android:layout_marginTop="30dp"
```
        android:layout_marginBottom="20dp"
```
        android:tint="#4285f4"/>

    <EditText
```
        android:id="@+id/textInput"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:hint="Enter text to speak"
```
        android:minLines="5"
```
        android:maxLines="8"
```
        android:padding="16dp"
```
        android:background="@android:color/white"
```
        android:layout_marginBottom="24dp"
```
        android:textSize="16sp"
```
        android:elevation="2dp"
```
        android:fontFamily="sans-serif-light"/>

    <Button
```
        android:id="@+id/speakButton"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:text="Speak with Speaker"
```
        android:textSize="18sp"
```
        android:background="#4285f4"
```
        android:textColor="@android:color/white"
```
        android:padding="18dp"
```
        android:layout_marginBottom="30dp"
```
        android:elevation="4dp"
```
        android:fontFamily="sans-serif-medium"
```
        android:stateListAnimator="@null"/>

    <TextView
```
        android:id="@+id/statusText"
```
        android:layout_width="wrap_content"
```
        android:layout_height="wrap_content"
```
        android:text="Status: Ready"
```
        android:textSize="16sp"
```
        android:textStyle="bold"
```
        android:textColor="#666666"
```
        android:fontFamily="sans-serif-light"/>
</LinearLayout>

MainActivity.java:
```
package com.example.englishtts;

```
import android.content.Context;
```
import android.media.AudioManager;
```
import android.os.Bundle;
```
import android.speech.tts.TextToSpeech;
```
import android.view.View;
```
import android.widget.Button;
```
import android.widget.EditText;
```
import android.widget.TextView;
```
import android.widget.Toast;

```
import androidx.appcompat.app.AppCompatActivity;

```
import java.util.Locale;

```
public class MainActivity extends AppCompatActivity {

```
    private AudioManager audioManager;
```
    private Button speakButton;
```
    private EditText textInput;
```
    private TextView statusText;
```
    private TextToSpeech textToSpeech;
```
    private boolean isSpeakerOn = false;

    @Override
```
    protected void onCreate(Bundle savedInstanceState) {
```
        super.onCreate(savedInstanceState);
```
        setContentView(R.layout.activity_main);

        // Initialize AudioManager
```
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        // Initialize UI components
```
        speakButton = findViewById(R.id.speakButton);
```
        textInput = findViewById(R.id.textInput);
```
        statusText = findViewById(R.id.statusText);

        // Set default text
```
        textInput.setText("Type something here and click the button below to hear it spoken.");

        // Setup button click listener
```
        speakButton.setOnClickListener(new View.OnClickListener() {
            @Override
```
            public void onClick(View v) {
```
                toggleSpeech();
```
            }
```
        });

        // Initialize TextToSpeech engine
```
        textToSpeech = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
```
            public void onInit(int status) {
```
                if (status == TextToSpeech.SUCCESS) {
                    // Set language to US English
```
                    int result = textToSpeech.setLanguage(Locale.US);
                    if (result == TextToSpeech.LANG_MISSING_DATA ||
```
                        result == TextToSpeech.LANG_NOT_SUPPORTED) {
```
                        showToast("English language pack not installed");
```
                    } else {
                        // Configure speech parameters
```
                        textToSpeech.setPitch(1.0f);
```
                        textToSpeech.setSpeechRate(1.0f);
```
                    }
```
                } else {
```
                    showToast("Failed to initialize TTS engine");
```
                }
```
            }
```
        });
```
    }

```
    private void toggleSpeech() {
```
        String text = textInput.getText().toString().trim();
```
        if (text.isEmpty()) {
```
            showToast("Please enter some text to speak");
```
            return;
```
        }

```
        try {
```
            if (isSpeakerOn) {
                // Turn off speaker and stop speaking
```
                stopSpeaking();
```
                speakButton.setText("Speak with Speaker");
```
                statusText.setText("Status: Speaker Off");
```
                statusText.setTextColor(getResources().getColor(android.R.color.darker_gray));
```
            } else {
                // Turn on speaker and start speaking
```
                startSpeaking(text);
```
                speakButton.setText("Stop Speaking");
```
                statusText.setText("Status: Speaking...");
```
                statusText.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
```
            }
```
            isSpeakerOn = !isSpeakerOn;
```
        } catch (Exception e) {
```
            e.printStackTrace();
```
            showToast("Error: " + e.getMessage());
```
        }
```
    }

```
    private void startSpeaking(String text) {
        // Set audio stream to speaker
```
        audioManager.setMode(AudioManager.MODE_NORMAL);
```
        audioManager.setSpeakerphoneOn(true);

        // Speak the text
```
        if (textToSpeech != null) {
```
            textToSpeech.stop();
```
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "tts1");
```
        }
```
    }

```
    private void stopSpeaking() {
        // Stop speaking and turn off speaker
```
        if (textToSpeech != null) {
```
            textToSpeech.stop();
```
        }
```
        audioManager.setSpeakerphoneOn(false);
```
    }

```
    private void showToast(String message) {
```
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
```
    }

    @Override
```
    protected void onDestroy() {
```
        super.onDestroy();
        // Clean up TTS resources
```
        if (textToSpeech != null) {
```
            textToSpeech.stop();
```
            textToSpeech.shutdown();
```
        }
```
    }
```
}

activity_main.xml:

<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
```
    android:layout_width="match_parent"
```
    android:layout_height="match_parent"
```
    android:orientation="vertical"
```
    android:gravity="center"
```
    android:padding="16dp">
    <Button
```
        android:id="@+id/playButton"
```
        android:layout_width="match_parent"
```
        android:layout_height="wrap_content"
```
        android:text="open speaker"
```
        android:textSize="18sp"
```
        android:padding="16dp"
```
        android:background="#4CAF50"
```
        android:textColor="#FFFFFF"
```
        android:layout_margin="16dp"/>
</LinearLayout>
