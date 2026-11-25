import Foundation
import AVFoundation
import React

@objc(AudioRecorder)
class AudioRecorder: NSObject {

  private var recorder: AVAudioRecorder?
  private var fileURL: URL?
  private var recordTimer: Timer?

  // MARK: - Start Recording
  @objc
  func start(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Safety: stop previous session if any
    cleanUp()

    do {
      let session = AVAudioSession.sharedInstance()

      try session.setCategory(
        .playAndRecord,
        mode: .default,
        options: [.defaultToSpeaker, .allowBluetooth]
      )

      try session.setActive(true)

      let dir = FileManager.default.temporaryDirectory
      let url = dir.appendingPathComponent("rec-\(UUID().uuidString).m4a")
      self.fileURL = url

      let settings: [String: Any] = [
        AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
        AVSampleRateKey: 44100,
        AVNumberOfChannelsKey: 1,
        AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
      ]

      recorder = try AVAudioRecorder(url: url, settings: settings)
      recorder?.isMeteringEnabled = true
      recorder?.prepareToRecord()
      recorder?.record()

      startRecordBackListener()

      resolve(url.path)
    } catch {
      reject("START_FAILED", error.localizedDescription, nil)
    }
  }

  // MARK: - Stop Recording
  @objc
  func stop(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let recorder = recorder, let url = fileURL else {
      reject("NO_RECORDING", "Recorder not started", nil)
      return
    }

    // Stop listener first
    removeRecordBackListener()

    recorder.stop()
    cleanUp()

    resolve(url.path)
  }

  // MARK: - Record Back Listener (Timer)
  private func startRecordBackListener() {
    recordTimer = Timer.scheduledTimer(
      withTimeInterval: 0.2,
      repeats: true
    ) { [weak self] _ in
      guard let self = self, let recorder = self.recorder else { return }

      recorder.updateMeters()
      let power = recorder.averagePower(forChannel: 0)
      let duration = recorder.currentTime

      // 🔥 OPTIONAL: Emit event to JS later
      // print("Power:", power, "Duration:", duration)
    }
  }

  // MARK: - Remove Listener
  @objc
  func removeRecordBackListener() {
    recordTimer?.invalidate()
    recordTimer = nil
  }

  // MARK: - Cleanup (IMPORTANT)
  private func cleanUp() {
    removeRecordBackListener()

    recorder?.stop()
    recorder = nil
    fileURL = nil

    let session = AVAudioSession.sharedInstance()
    try? session.setActive(false, options: .notifyOthersOnDeactivation)
  }
}
